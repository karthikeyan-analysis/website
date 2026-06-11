import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useUserAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    const result = await resetPassword(email.trim().toLowerCase());
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/">
            <img src="/logo.jpeg" alt="Karthikeyan Analysis" className="h-16 w-16 rounded-2xl object-cover shadow-md" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black text-brand-navy">Reset Password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-8">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Check your inbox</h2>
              <p className="text-sm text-slate-500">
                We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                to="/login"
                className="mt-2 inline-block text-sm font-semibold text-brand-navy hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-black/10 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-navy py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-navy/90 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-brand-navy hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
