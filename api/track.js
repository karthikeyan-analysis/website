import { load } from "cheerio";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Accept, Content-Type, Date, X-Api-Version",
  );
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const awb = String(req.query.awb || "").trim();
  if (!awb) return res.status(400).json({ error: "AWB number is required" });

  try {
    const formData = new FormData();
    formData.append("awb_no", awb);

    const response = await fetch("https://stcourier.com/track/doCheck", {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Origin: "https://stcourier.com",
        Referer: "https://stcourier.com/track/shipment",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Tracking service unavailable. Please try again later." });
    }

    const html = await response.text();

    if (!html || html.trim().length < 50) {
      return res.status(404).json({ error: "No tracking information found for this AWB number." });
    }

    const $ = load(html);

    // Check for "no records found" type messages
    const bodyText = $("body").text().toLowerCase();
    if (
      bodyText.includes("no records found") ||
      bodyText.includes("invalid awb") ||
      bodyText.includes("not found")
    ) {
      return res.status(404).json({ error: "No tracking information found for this AWB number." });
    }

    // Extract summary table (current status, origin, destination, etc.)
    const summary = {};
    $("table tr, .tracking-summary tr, .status-table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const key = $(cells[0]).text().trim().toLowerCase().replace(/\s+/g, "_");
        const value = $(cells[1]).text().trim();
        if (key && value) summary[key] = value;
      }
    });

    // Also try th/td pairs
    $("table").each((_, table) => {
      $(table).find("tr").each((_, row) => {
        const th = $(row).find("th").first().text().trim();
        const td = $(row).find("td").first().text().trim();
        if (th && td) {
          const k = th.toLowerCase().replace(/\s+/g, "_");
          summary[k] = td;
        }
      });
    });

    // Extract timeline events — look for rows with date/time/status/location patterns
    const events = [];

    // Strategy 1: Look for rows with date patterns like "Jun 09, 2026"
    const datePattern = /[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/;
    const timePattern = /\d{1,2}:\d{2}\s*[AP]M/i;

    $("tr, .tracking-row, .event-row, .step").each((_, el) => {
      const text = $(el).text();
      if (!datePattern.test(text)) return;

      const tds = $(el).find("td, div, span").toArray();
      const allTexts = tds.map((t) => $(t).text().trim()).filter(Boolean);

      // Find date, time, status, location from cell texts
      let date = "";
      let time = "";
      let status = "";
      let location = "";

      for (const t of allTexts) {
        if (!date && datePattern.test(t)) date = t.match(datePattern)?.[0] || "";
        if (!time && timePattern.test(t)) time = t.match(timePattern)?.[0] || "";
        if (!status && !datePattern.test(t) && !timePattern.test(t) && t.length > 3 && t.length < 80) {
          status = t;
        }
        if (status && !location && !datePattern.test(t) && !timePattern.test(t) && t !== status && t.length > 3) {
          location = t;
        }
      }

      // Fallback: split full row text
      if (!date || !status) {
        const full = $(el).text().replace(/\s+/g, " ").trim();
        const dateMatch = full.match(datePattern);
        const timeMatch = full.match(timePattern);
        if (dateMatch) date = dateMatch[0];
        if (timeMatch) time = timeMatch[0];
      }

      if (date && status) {
        events.push({ date, time, status, location });
      }
    });

    // Strategy 2: If no events found, try parsing structured divs
    if (events.length === 0) {
      $("[class*='track'], [class*='event'], [class*='status'], [class*='timeline']").each((_, el) => {
        const text = $(el).text().replace(/\s+/g, " ").trim();
        if (!datePattern.test(text)) return;
        const dateMatch = text.match(datePattern);
        const timeMatch = text.match(timePattern);
        if (dateMatch) {
          events.push({
            date: dateMatch[0],
            time: timeMatch?.[0] || "",
            status: text.replace(dateMatch[0], "").replace(timeMatch?.[0] || "", "").trim().slice(0, 80),
            location: "",
          });
        }
      });
    }

    // Build result from what we parsed
    const result = {
      awb,
      currentStatus: summary["current_status"] || summary["status"] || "",
      originSrc: summary["orgin_src"] || summary["origin_src"] || summary["origin"] || "",
      destination: summary["destination"] || "",
      consignment: summary["consignment"] || "",
      bookDate: summary["book_date/time"] || summary["book_date"] || summary["booking_date"] || "",
      deliveryDate: summary["delivery_date/time"] || summary["delivery_date"] || "",
      events: events.slice(0, 20),
      rawSummary: summary,
    };

    if (!result.currentStatus && events.length === 0) {
      return res.status(404).json({ error: "No tracking information found for this AWB number." });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Track API error:", err);
    return res.status(500).json({ error: "Failed to fetch tracking data. Please try again." });
  }
}
