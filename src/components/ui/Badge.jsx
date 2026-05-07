export default function Badge({ tone = "neutral", className = "", children }) {
  const tones = {
    neutral: "bg-black/[0.04] text-brand-black/80 ring-black/10",
    success: "bg-brand-sky/15 text-brand-navy ring-brand-sky/25",
    danger: "bg-brand-maroon/12 text-brand-maroon ring-brand-maroon/25",
    gold: "bg-brand-orange/15 text-brand-navy ring-brand-orange/25",
    navy: "bg-brand-navy text-white ring-brand-navy/20",
    aurora: "bg-brand-navy/8 text-brand-navy ring-brand-navy/15",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold leading-none ring-1 sm:text-xs ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
