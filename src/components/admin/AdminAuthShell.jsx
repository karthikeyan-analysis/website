export default function AdminAuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-maroon to-brand-sky flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-brand-navy via-brand-maroon to-brand-sky rounded-xl flex items-center justify-center text-white font-bold text-xl">
                KA
              </div>
            </div>
            <h1 className="text-3xl font-bold text-brand-navy">{title}</h1>
            {subtitle && (
              <p className="text-brand-black/60">{subtitle}</p>
            )}
          </div>

          {children}

          {footer}
        </div>
      </div>
    </div>
  );
}
