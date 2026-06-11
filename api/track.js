import { load } from "cheerio";

const ST_BASE = "https://stcourier.com";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Accept, Content-Type, Date, X-Api-Version",
  );
}

// Build a cookie string from the raw Set-Cookie header(s)
function parseCookies(setCookieHeader) {
  if (!setCookieHeader) return "";
  // Vercel fetch gives a single string; split on ", " between cookies but not within expires values
  const parts = setCookieHeader.split(/,(?=[^ ])/);
  return parts.map((p) => p.split(";")[0].trim()).join("; ");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const awb = String(req.query.awb || "").trim();
  if (!awb) return res.status(400).json({ error: "AWB number is required" });

  try {
    // ── Step 1: Load the tracking page to capture session cookies + CSRF token ──
    let cookies = "";
    let csrfToken = "";

    try {
      const pageResp = await fetch(`${ST_BASE}/track/shipment`, {
        headers: {
          "User-Agent": BROWSER_UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
      });
      cookies = parseCookies(pageResp.headers.get("set-cookie"));
      const html = await pageResp.text();
      const $p = load(html);
      csrfToken =
        $p('meta[name="csrf-token"]').attr("content") ||
        $p('input[name="_token"]').val() ||
        "";
    } catch {
      // proceed without session — some hosts allow stateless POSTs
    }

    // ── Step 2: POST the AWB to doCheck (url-encoded, not multipart) ──
    const body = new URLSearchParams();
    body.append("awb_no", awb);
    if (csrfToken) body.append("_token", csrfToken);

    const postHeaders = {
      "User-Agent": BROWSER_UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Origin: ST_BASE,
      Referer: `${ST_BASE}/track/shipment`,
      "Upgrade-Insecure-Requests": "1",
    };
    if (cookies) postHeaders["Cookie"] = cookies;

    const trackResp = await fetch(`${ST_BASE}/track/doCheck`, {
      method: "POST",
      headers: postHeaders,
      body: body.toString(),
      redirect: "follow",
    });

    if (!trackResp.ok) {
      return res
        .status(502)
        .json({ error: "Tracking service unavailable. Please try again later." });
    }

    const html = await trackResp.text();

    if (!html || html.trim().length < 30) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    const $ = load(html);
    const bodyText = $("body").text();

    // Reject obvious "not found" responses
    const lower = bodyText.toLowerCase();
    if (
      lower.includes("no records found") ||
      lower.includes("invalid awb") ||
      lower.includes("awb not found") ||
      (lower.includes("not found") && lower.length < 300)
    ) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    // ── Step 3: Parse the summary table (key → value rows) ──
    const summary = {};

    $("table").each((_, tbl) => {
      $(tbl)
        .find("tr")
        .each((_, row) => {
          const tds = $(row).find("td");
          if (tds.length >= 2) {
            const key = $(tds[0])
              .text()
              .trim()
              .replace(/[:\s]+$/, "")
              .toLowerCase()
              .replace(/[\s/]+/g, "_");
            const val = $(tds[1]).text().trim();
            if (key && val) summary[key] = val;
          }
          // th + td pairs
          const ths = $(row).find("th");
          const tds2 = $(row).find("td");
          if (ths.length && tds2.length) {
            const key = $(ths[0])
              .text()
              .trim()
              .toLowerCase()
              .replace(/[\s/]+/g, "_");
            const val = $(tds2[0]).text().trim();
            if (key && val) summary[key] = val;
          }
        });
    });

    // ── Step 4: Parse tracking event rows ──
    const events = [];
    const dateRe = /[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/;
    const timeRe = /\d{1,2}:\d{2}\s*[AP]M/i;

    // First pass: look for <tr> elements that contain a date pattern
    $("table tr").each((_, row) => {
      const rowText = $(row).text();
      if (!dateRe.test(rowText)) return;

      const tds = $(row).find("td");
      if (tds.length === 0) return;

      // Collect all non-empty cell texts
      const cells = tds
        .toArray()
        .map((td) => $(td).text().replace(/\s+/g, " ").trim())
        .filter(Boolean);

      let date = "",
        time = "",
        status = "",
        location = "";

      // Extract date and time from any cell
      for (const c of cells) {
        if (!date) {
          const m = c.match(dateRe);
          if (m) date = m[0];
        }
        if (!time) {
          const m = c.match(timeRe);
          if (m) time = m[0];
        }
      }

      // Remaining cells become status then location
      for (const c of cells) {
        if (dateRe.test(c) || timeRe.test(c)) continue;
        if (!status && c.length > 2) {
          status = c.slice(0, 120);
        } else if (!location && c.length > 2 && c !== status) {
          location = c.slice(0, 80);
        }
      }

      // Some rows put date+time in a single cell like "Jun 09, 2026\n07:25 PM"
      if (date) {
        events.push({ date, time, status, location });
      }
    });

    // Second pass: if table parsing yielded nothing, walk text lines
    if (events.length === 0) {
      const lines = bodyText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const dateMatch = lines[i].match(dateRe);
        if (!dateMatch) continue;

        const date = dateMatch[0];
        const timeMatch =
          lines[i].match(timeRe) ||
          (lines[i + 1] ? lines[i + 1].match(timeRe) : null);
        const time = timeMatch ? timeMatch[0] : "";

        // Next non-date, non-time lines are status / location
        let status = "",
          location = "";
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const l = lines[j];
          if (dateRe.test(l) || timeRe.test(l)) break;
          if (!status) status = l.slice(0, 120);
          else if (!location) {
            location = l.slice(0, 80);
            break;
          }
        }

        events.push({ date, time, status, location });
      }
    }

    // ── Step 5: Build the response ──
    const currentStatus =
      summary["current_status"] ||
      summary["status"] ||
      summary["delivery_status"] ||
      (events[0]?.status ?? "");

    const result = {
      awb,
      currentStatus,
      originSrc:
        summary["orgin_src"] ||
        summary["origin_src"] ||
        summary["origin"] ||
        "",
      destination: summary["destination"] || "",
      consignment: summary["consignment"] || "",
      bookDate:
        summary["book_date_time"] ||
        summary["book_date"] ||
        summary["booking_date"] ||
        "",
      deliveryDate:
        summary["delivery_date_time"] ||
        summary["delivery_date"] ||
        "",
      events: events.slice(0, 20),
    };

    if (!result.currentStatus && result.events.length === 0) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Track API error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch tracking data. Please try again." });
  }
}
