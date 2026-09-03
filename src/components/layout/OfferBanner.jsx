import { ExternalLink, Megaphone, Sparkles, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { offerTickerService } from "../../services/firebaseService";

const STUDENT_PORTAL_PUBLIC_LOGIN =
  "https://karthikeyananalysisstudycircle.vercel.app/public/login";
const STUDENT_PORTAL_PUBLIC_REGISTER =
  "https://karthikeyananalysisstudycircle.vercel.app/public/register";

export default function OfferBanner() {
  const location = useLocation();
  const [settings, setSettings] = useState(() =>
    offerTickerService.getDefaultSettings(),
  );

  useEffect(() => {
    const unsub = offerTickerService.subscribeOfferTicker(setSettings);
    return () => unsub();
  }, []);

  const line = useMemo(
    () => settings.messages.join("   \u2022   "),
    [settings.messages],
  );

  const durationSec = useMemo(
    () => Math.min(80, Math.max(28, 18 + line.length * 0.07)),
    [line.length],
  );

  if (location.pathname.startsWith("/admin")) return null;
  if (!settings.enabled || settings.messages.length === 0) return null;

  const textStyle = {
    display: "inline-block",
    padding: "0 2.5rem",
    fontSize: "13px",
    lineHeight: "1.125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "rgb(26 54 130 / 0.9)",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{ width: "100%", overflow: "hidden" }}
      className="border-y border-black/[0.06] bg-slate-100"
    >
      {/* Row: icon + clip box + hall ticket action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 12px",
          maxWidth: "85rem",
          margin: "0 auto",
        }}
      >
        {/* Icon — shrink-0 so it never collapses */}
        <span
          style={{ flexShrink: 0 }}
          className="flex size-5 items-center justify-center rounded bg-brand-purple/15 text-brand-purple ring-1 ring-brand-purple/20 sm:size-6"
          aria-hidden
        >
          <Megaphone className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.25} />
        </span>

        {/*
         * CLIP BOX — position:relative + overflow:hidden + explicit height.
         * flex:1 + minWidth:0 fills remaining row space without overflowing.
         */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
            height: "1.25rem",
          }}
        >
          {/* Accessible text for screen readers */}
          <p className="sr-only">{line}</p>

          {/* TRACK */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              whiteSpace: "nowrap",
              willChange: "transform",
              animation: `offer-marquee ${durationSec}s linear infinite`,
            }}
          >
            <span style={textStyle}>{line}</span>
            <span style={textStyle}>{line}</span>
          </div>
        </div>

        {/* Action Button: Attend CBT Test using Hall Ticket Credentials */}
        <div
          style={{ flexShrink: 0 }}
          className="flex items-center gap-1.5 pl-1"
        >
          <a
            href={STUDENT_PORTAL_PUBLIC_LOGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-brand-navy px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-brand-navy/90 active:scale-95 ring-1 ring-brand-navy/30 sm:text-xs sm:px-3"
            title="Attend CBT Mock Test using your Hall Ticket Username & Passcode"
          >
            <UserCheck className="h-3 w-3 text-emerald-300 sm:h-3.5 sm:w-3.5" />
            <span>Attend Test (Hall Ticket)</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-80" />
          </a>

          <a
            href={STUDENT_PORTAL_PUBLIC_REGISTER}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 rounded-md bg-white border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            title="Register for Free Online CBT Mock Test"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Register Test</span>
          </a>
        </div>
      </div>
    </div>
  );
}
