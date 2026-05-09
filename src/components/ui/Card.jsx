export default function Card({ className = "", color = "default", children }) {
  const colorClasses = {
    default: "bg-white/85",
    blue: "bg-blue-50/85",
    orange: "bg-orange-50/85",
    purple: "bg-purple-50/85",
    green: "bg-green-50/85",
    pink: "bg-pink-50/85",
    cyan: "bg-cyan-50/85",
    amber: "bg-amber-50/85",
    rose: "bg-rose-50/85",
  };

  const bgColor = colorClasses[color] || colorClasses.default;

  return (
    <div
      className={`group relative rounded-2xl ${bgColor} p-5 shadow-card ring-1 ring-black/[0.06] backdrop-blur-sm transition-shadow duration-300 hover:shadow-elevate sm:p-7 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-brand-navy/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
