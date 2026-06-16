import { load } from "cheerio";

const ST_BASE = "https://stcourier.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Per-request timeout (ms)
const REQUEST_TIMEOUT = 12000;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Accept, Content-Type");
}

function extractCookies(raw) {
  if (!raw) return "";
  return raw
    .split(/,(?=\s*\w+=)/)
    .map((c) => c.split(";")[0].trim())
    .join("; ");
}

function buildMultipart(fields, boundary) {
  let body = "";
  for (const [name, value] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;
  return body;
}

// Fetch with a hard timeout so requests never hang indefinitely
async function fetchTimeout(url, options = {}, ms = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw err;
  }
}

function parseLines(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const awb = String(req.query.awb || "").trim();
  if (!awb) return res.status(400).json({ error: "AWB number is required" });

  try {
    // ── Step 1: POST awb_no to doCheck (no prior session needed) ─────────────
    // Laravel creates a new session on first POST and returns set-cookie.
    const boundary = "----Boundary" + Date.now().toString(36);
    const multipart = buildMultipart({ awb_no: awb }, boundary);

    const postResp = await fetchTimeout(`${ST_BASE}/track/doCheck`, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Origin: ST_BASE,
        Referer: `${ST_BASE}/track/shipment`,
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      body: multipart,
      redirect: "follow",
    });

    // Grab the session cookie the POST response sets
    const sessionCookie = extractCookies(postResp.headers.get("set-cookie"));

    const postJson = await postResp.json().catch(() => ({}));
    if (postJson?.code !== 200) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    // ── Step 2: GET the result page (server renders data using session) ───────
    const getResp = await fetchTimeout(
      `${ST_BASE}/track/shipment/${encodeURIComponent(awb)}`,
      {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          Referer: `${ST_BASE}/track/shipment`,
          ...(sessionCookie && { Cookie: sessionCookie }),
        },
        redirect: "follow",
      }
    );

    const html = await getResp.text();
    if (!html || html.length < 100) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    const $ = load(html);

    // If page has no tracking data (session didn't carry through), retry with full 3-step flow
    if (!html.includes("Current Status")) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    // ── Parse summary table (td key / td value pairs) ─────────────────────────
    const summary = {};
    $("table tr").each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length >= 2) {
        const key = $(tds.get(0))
          .text()
          .trim()
          .toLowerCase()
          .replace(/[:/\s]+/g, "_")
          .replace(/_+$/, "");
        const val = $(tds.get(1)).text().trim();
        if (key && val) summary[key] = val;
      }
    });

    // ── Parse timeline events (.tl16 layout class as of 2026) ───────────────
    // Each .tl16 block: first child = date/time, last child = status/location
    const events = [];
    $(".tl16").each((_, block) => {
      const children = $(block).children("div").toArray();
      if (children.length < 2) return;

      const dateLines = parseLines($(children[0]).html() || "");
      const statusLines = parseLines($(children[children.length - 1]).html() || "");

      const date = dateLines[0] || "";
      const time = dateLines[1] || "";
      const status = statusLines[0] || "";
      const location = statusLines.slice(1).join(" – ").trim();

      if (date || status) events.push({ date, time, status, location });
    });

    const result = {
      awb,
      currentStatus:
        summary["current_status"] ||
        summary["status"] ||
        events[0]?.status ||
        "",
      originSrc:
        summary["orgin_src"] || summary["origin_src"] || summary["origin"] || "",
      destination: summary["destination"] || "",
      consignment: summary["consignment"] || "",
      bookDate:
        summary["book_date_time"] || summary["book_date"] || "",
      deliveryDate:
        summary["delivery_date_time"] || summary["delivery_date"] || "",
      events: events.slice(0, 20),
    };

    if (!result.currentStatus && result.events.length === 0) {
      return res
        .status(404)
        .json({ error: "No tracking information found for this AWB number." });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Track error:", err?.message);
    if (err?.message === "Request timed out") {
      return res.status(504).json({
        error:
          "ST Courier server is taking too long. Please track directly on stcourier.com.",
      });
    }
    return res
      .status(500)
      .json({ error: "Failed to fetch tracking data. Please try again." });
  }
}
