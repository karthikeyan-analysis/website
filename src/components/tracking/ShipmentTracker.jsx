import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_ICONS = {
  delivered: CheckCircle2,
  "out for delivery": Truck,
  "in transit": Package,
  processed: Package,
  default: Circle,
};

function getStatusIcon(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("deliver")) return CheckCircle2;
  if (s.includes("out for")) return Truck;
  if (s.includes("transit") || s.includes("forwarded")) return Package;
  return Circle;
}

function getStatusColor(status, idx) {
  const s = String(status || "").toLowerCase();
  if (idx === 0) {
    if (s.includes("deliver")) return { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" };
    if (s.includes("out for")) return { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" };
    return { dot: "bg-brand-navy", text: "text-brand-navy", bg: "bg-brand-navy/5" };
  }
  return { dot: "bg-slate-300", text: "text-slate-500", bg: "bg-transparent" };
}

export default function ShipmentTracker({ awb }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!awb) return;
    setLoading(true);
    setError("");
    setData(null);

    fetch(`/api/track?awb=${encodeURIComponent(awb)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch tracking.");
        return json;
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message || "Could not fetch tracking data."))
      .finally(() => setLoading(false));
  }, [awb]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Fetching live tracking data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}{" "}
        <a
          href={`https://stcourier.com/track/shipment`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold underline"
        >
          Track on ST Courier <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border border-black/[0.07] bg-white overflow-hidden">
      {/* Summary header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy/80 px-4 py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              ST Courier — AWB: {awb}
            </p>
            {data.currentStatus && (
              <p className="mt-0.5 text-base font-bold">{data.currentStatus}</p>
            )}
          </div>
          <a
            href={`https://stcourier.com/track/shipment`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold transition hover:bg-white/20"
          >
            <ExternalLink className="h-3 w-3" />
            View Full
          </a>
        </div>
      </div>

      {/* Summary details grid */}
      {(data.originSrc || data.destination || data.bookDate || data.deliveryDate || data.consignment) && (
        <div className="grid grid-cols-2 gap-px bg-black/[0.06] border-b border-black/[0.06] sm:grid-cols-3">
          {[
            { label: "From", value: data.originSrc },
            { label: "To", value: data.destination },
            { label: "Consignment", value: data.consignment },
            { label: "Booked On", value: data.bookDate },
            { label: "Delivered On", value: data.deliveryDate },
          ]
            .filter((f) => f.value)
            .map(({ label, value }) => (
              <div key={label} className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
              </div>
            ))}
        </div>
      )}

      {/* Timeline */}
      {data.events && data.events.length > 0 ? (
        <div className="p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Tracking Timeline
          </p>
          <ol className="relative space-y-4 pl-5 before:absolute before:left-[7px] before:top-1.5 before:h-[calc(100%-12px)] before:w-px before:bg-black/[0.08]">
            {data.events.map((event, idx) => {
              const Icon = getStatusIcon(event.status);
              const colors = getStatusColor(event.status, idx);
              return (
                <li key={idx} className="relative flex gap-3">
                  <span
                    className={`absolute -left-5 mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${colors.dot} ring-2 ring-white`}
                  />
                  <div className={`min-w-0 flex-1 rounded-xl px-3 py-2.5 ${idx === 0 ? colors.bg : "bg-slate-50/60"}`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {event.date && (
                        <span className={`text-xs font-semibold ${idx === 0 ? colors.text : "text-slate-500"}`}>
                          {event.date}
                        </span>
                      )}
                      {event.time && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                      )}
                    </div>
                    {event.status && (
                      <p className={`mt-0.5 text-sm font-semibold ${idx === 0 ? colors.text : "text-slate-600"}`}>
                        <Icon className={`mr-1 inline h-3.5 w-3.5 ${idx === 0 ? colors.text : "text-slate-400"}`} />
                        {event.status}
                      </p>
                    )}
                    {event.location && (
                      <p className="mt-0.5 flex items-center gap-0.5 text-xs text-slate-400">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="px-4 py-4 text-center text-sm text-slate-400">
          No detailed timeline available.{" "}
          <a
            href="https://stcourier.com/track/shipment"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-navy underline"
          >
            Check on ST Courier
          </a>
        </div>
      )}
    </div>
  );
}
