import Badge from "./Badge";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  theme = "light",
}) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const isDark = theme === "dark";

  return (
    <div className={alignClass}>
      {eyebrow ? (
        <div className={align === "center" ? "flex justify-center" : ""}>
          <Badge tone="aurora">{eyebrow}</Badge>
        </div>
      ) : null}
      <h2
        className={`mt-4 font-extrabold text-2xl leading-[1.12] tracking-tight sm:text-3xl md:text-4xl ${isDark ? "text-white" : "text-brand-navy"}`}
      >
        <span className={isDark ? "text-white" : "text-brand-navy"}>
          {title}
        </span>
      </h2>
      {subtitle ? (
        <p
          className={`mt-3 w-full max-w-none text-sm leading-relaxed md:text-base ${isDark ? "text-white/[0.82]" : "text-brand-black/65"}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
