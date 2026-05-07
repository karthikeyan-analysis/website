const styles = {
  base: "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
  primary:
    "bg-brand-navy text-white shadow-card ring-1 ring-brand-navy/10 hover:bg-brand-navy/[0.92]",
  secondary:
    "bg-white text-brand-navy shadow-sm ring-1 ring-black/[0.08] hover:bg-slate-50",
  ghost: "text-brand-navy hover:bg-black/[0.04]",
  gradient:
    "bg-brand-navy text-white shadow-card ring-1 ring-brand-navy/10 hover:bg-brand-navy/[0.92]",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`${styles.base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
