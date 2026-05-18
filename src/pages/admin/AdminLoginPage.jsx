import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import AdminAuthShell from "../../components/admin/AdminAuthShell";

const inputClassName =
  "w-full px-4 py-3 border-2 border-brand-black/10 rounded-lg focus:outline-none focus:border-brand-navy transition bg-white";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <AdminAuthShell
      title="Admin Login"
      subtitle="Sign in to the Karthikeyan Analysis admin panel"
      footer={
        <p className="text-center text-sm text-brand-black/60">
          Need an account?{" "}
          <Link
            to="/admin/signup"
            className="font-semibold text-brand-navy hover:underline"
          >
            Create admin account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="admin-login-email"
            className="mb-2 block text-sm font-semibold text-brand-navy"
          >
            Email address
          </label>
          <input
            id="admin-login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClassName}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="admin-login-password"
            className="mb-2 block text-sm font-semibold text-brand-navy"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${inputClassName} pr-12`}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/50 hover:text-brand-navy"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-brand-navy via-brand-maroon to-brand-sky py-3 font-bold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AdminAuthShell>
  );
}
