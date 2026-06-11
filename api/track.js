import { load } from "cheerio";

const ST_BASE = "https://stcourier.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Accept, Content-Type");
}

// Extract Set-Cookie values into a single cookie string
function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return "";
  return setCookieHeader
    .split(/,(?=\s*\w+=)/)
    .map((c) => c.split(";")[0].trim())
    .join("; ");
}

// Build a multipart/form-data body manually (same as browser FormData)
function buildMultipart(fields, boundary) {
  let body = "";
  for (const [name, value] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;
  return body;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const awb = String(req.query.awb || "").trim();
  if (!awb) return res.status(400).json({ error: "AWB number is required" });

  try {
    // ── Step 1: GET tracking page to capture session cookie ──────────────────
    const step1 = await fetch(`${ST_BASE}/track/shipment`, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });
    const cookies = extractCookies(step1.headers.get("set-cookie"));

    // ── Step 2: POST AWB with multipart/form-data (exactly as the browser does) ──
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).slice(2, 18);
    const multipartBody = buildMultipart({ awb_no: awb }, boundary);

    const step2 = await fetch(`${ST_BASE}/track/doCheck`, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Origin: ST_BASE,
        Referer: `${ST_BASE}/track/shipment`,
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
        ...(cookies && { Cookie: cookies }),
      },
      body: multipartBody,
      redirect: "follow",
    });

    let postCookies = cookies;
    const newCookies = extractCookies(step2.headers.get("set-cookie"));
    if (newCookies) postCookies = [cookies, newCookies].filter(Boolean).join("; ");

    const postJson = await step2.json().catch(() => ({}));
    if (postJson?.code !== 200) {
      return res.status(404).json({ error: "No tracking information found for this AWB number." });
    }

    // ── Step 3: GET the tracking result page (server renders data with session) ──
    const step3 = await fetch(`${ST_BASE}/track/shipment/${encodeURIComponent(awb)}`, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: `${ST_BASE}/track/shipment`,
        ...(postCookies && { Cookie: postCookies }),
      },
      redirect: "follow",
    });

    const html = await step3.text();
    if (!html || html.length < 100) {
      return res.status(404).json({ error: "No tracking information found for this AWB number." });
    }

    const $ = load(html);

    // ── Parse summary table (td key / td value pairs) ──
    const summary = {};
    $("table tr").each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length >= 2) {
        const key = $(tds.get(0)).text().trim().toLowerCase().replace(/[:/\s]+/g, "_").replace(/_+$/,"");
        const val = $(tds.get(1)).text().trim();
        if (key && val) summary[key] = val;
      }
    });

    // ── Parse timeline events ──
    // Each event block has class "tl11" (stable layout class).
    // Structure inside each block:
    //   First div  (left, 25%)  → date + time separated by <br>
    //   Middle div (icon, absolute) → skip
    //   Last div   (right, 65%) → status + location separated by <br>
    const events = [];

    $(".tl11").each((_, block) => {
      const children = $(block).children("div").toArray();
      if (children.length < 2) return;

      // Date/time is the FIRST child div (left column)
      const dateHtml = $(children[0]).html() || "";
      // Status/location is the LAST child div (right column)
      const statusHtml = $(children[children.length - 1]).html() || "";

      const parseLines = (raw) =>
        raw
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/&nbsp;/gi, " ")
          .replace(/<[^>]+>/g, "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

      const dateLines = parseLines(dateHtml);
      const statusLines = parseLines(statusHtml);

      const date = dateLines[0] || "";
      const time = dateLines[1] || "";
      const status = statusLines[0] || "";
      const location = statusLines.slice(1).join(" – ").trim();

      if (date || status) {
        events.push({ date, time, status, location });
      }
    });

    // ── Build final result ──
    const result = {
      awb,
      currentStatus: summary["current_status"] || summary["status"] || (events[0]?.status || ""),
      originSrc: summary["orgin_src"] || summary["origin_src"] || summary["origin"] || "",
      destination: summary["destination"] || summary["destination_"] || "",
      consignment: summary["consignment"] || summary["consignment_"] || "",
      bookDate: summary["book_date_time"] || summary["book_date"] || "",
      deliveryDate: summary["delivery_date_time"] || summary["delivery_date"] || "",
      events: events.slice(0, 20),
    };

    if (!result.currentStatus && result.events.length === 0) {
      return res.status(404).json({ error: "No tracking information found for this AWB number." });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Track API error:", err?.message || err);
    return res.status(500).json({ error: "Failed to fetch tracking data. Please try again." });
  }
}
