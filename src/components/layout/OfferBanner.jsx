import { Megaphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { offerTickerService } from "../../services/firebaseService";

/*
 * HOW THIS MARQUEE WORKS (the only approach that never breaks mobile layout):
 *
 * 1. The clip wrapper is `position: relative; overflow: hidden`.
 *    Its width is set by its flex parent (never by children).
 *
 * 2. The track is `position: absolute` — completely OUT of document flow.
 *    An absolutely-positioned element cannot expand its parent's intrinsic width.
 *
 * 3. The track contains the text TWICE. The keyframe goes:
 *       translateX(0)  →  translateX(-50%)
 *    Because the track is 2× the text width, -50% = exactly one text width,
 *    producing a seamless infinite loop.
 *
 * 4. translateY(-50%) centres the text vertically inside the clip box.
 */

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
    fontSize: "14px",
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
      {/* Row: icon + clip box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 16px",
          maxWidth: "80rem",
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
         * The fixed height is essential when the track is absolutely positioned.
         */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
            height: "1.125rem",
          }}
        >
          {/* Accessible text for screen readers */}
          <p className="sr-only">{line}</p>

          {/*
           * TRACK — position:absolute takes it OUT of layout flow.
           * It can never widen the page. top:50% + translateY(-50%) centres it.
           * The animation is defined in index.css as @keyframes offer-marquee.
           */}
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
      </div>
    </div>
  );
}
