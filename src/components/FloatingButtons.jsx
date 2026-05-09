import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const socialLinks = [
  {
    name: "Telegram",
    url: "https://t.me/karthikeyananalysis",
    icon: "fab fa-telegram",
    color: "#2599CE",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@karthikeyananalysis",
    icon: "fab fa-youtube",
    color: "#FF0000",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/karthikeyan_analysis?igsh=ZWw2ZGd6ZnEyeHA=",
    icon: "fab fa-instagram",
    color: "#E4405F",
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/message/LNAXQMM3G4OBM1",
    icon: "fab fa-whatsapp",
    color: "#25D366",
  },
];

export default function FloatingButtons() {
  const [collapsed, setCollapsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    try {
      // Always start expanded on initial load.
      setCollapsed(false);
      localStorage.setItem("floatingButtonsCollapsed", "0");
      localStorage.setItem("floatingButtonsHintSeen", "1");
    } catch {
      // ignore
    }
  }, []);

  const setCollapsedPersist = (next) => {
    setCollapsed(next);
    try {
      localStorage.setItem("floatingButtonsCollapsed", next ? "1" : "0");
      localStorage.setItem("floatingButtonsHintSeen", "1");
    } catch {
      // ignore
    }
    if (next === false) setShowHint(false);
  };

  return (
    <div
      className="floating-buttons pointer-events-none opacity-100 transition-opacity duration-200"
      style={{
        position: "fixed",
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))",
        right: "max(1rem, env(safe-area-inset-right, 1rem))",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Collapse / Expand */}
      <div className="relative ml-auto" style={{ pointerEvents: "auto" }}>
        <AnimatePresence initial={false}>
          {showHint && collapsed ? (
            <motion.button
              key="hint"
              type="button"
              onClick={() => setCollapsedPersist(false)}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-brand-navy shadow-[0_10px_28px_-10px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.08]"
              aria-label="Open quick contact and social buttons"
              title="Open"
            >
              Tap to open 👆
            </motion.button>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setCollapsedPersist(!collapsed)}
          className="flex size-10 items-center justify-center rounded-full bg-brand-navy text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.08] transition active:scale-95 hover:bg-brand-navy/90"
          aria-label={collapsed ? "Open floating buttons" : "Close floating buttons"}
          title={collapsed ? "Open" : "Close"}
        >
          <motion.i
            className="fa-solid fa-chevron-up text-[12px]"
            aria-hidden
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {collapsed ? null : (
          <motion.div
            key="floating-stack"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col gap-[10px]"
          >
      {/* Call + Email (icon-only) */}
      <a
        href="tel:+916385939895"
        aria-label="Call +91 63859 39895"
        style={{ pointerEvents: "auto" }}
        className="group relative flex size-11 touch-manipulation items-center justify-center rounded-full bg-brand-cta text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.08] transition-transform duration-150 active:scale-95 hover:scale-110 sm:size-12"
        title="Call"
      >
        <i className="fa-solid fa-phone text-[16px] leading-none" aria-hidden />
        <span className="pointer-events-none absolute right-[calc(100%+0.5rem)] hidden whitespace-nowrap rounded-md bg-gray-900/90 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 md:block">
          Call
        </span>
      </a>

      <a
        href="mailto:karthikeyananalysisstudycircle@gmail.com"
        aria-label="Email karthikeyananalysisstudycircle@gmail.com"
        style={{ pointerEvents: "auto" }}
        className="group relative flex size-11 touch-manipulation items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.08] transition-transform duration-150 active:scale-95 hover:scale-110 sm:size-12"
        title="Email"
      >
        <i className="fa-solid fa-envelope text-[16px] leading-none text-brand-navy" aria-hidden />
        <span className="pointer-events-none absolute right-[calc(100%+0.5rem)] hidden whitespace-nowrap rounded-md bg-gray-900/90 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 md:block">
          Email
        </span>
      </a>

      {/* Social buttons (bottom-right) */}
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.name} (opens in new tab)`}
          style={{ pointerEvents: "auto" }}
          className="group relative flex size-11 touch-manipulation items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.08] transition-transform duration-150 active:scale-95 hover:scale-110 sm:size-12"
        >
          <i
            style={{ color: link.color, fontSize: "17px", lineHeight: 1 }}
            className={`${link.icon}`}
            aria-hidden
          />
          <span className="pointer-events-none absolute right-[calc(100%+0.5rem)] hidden whitespace-nowrap rounded-md bg-gray-900/90 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 md:block">
            {link.name}
          </span>
        </a>
      ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
