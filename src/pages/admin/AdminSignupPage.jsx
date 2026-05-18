import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import AdminAuthShell from "../../components/admin/AdminAuthShell";
import {
  getSignupSecretRequired,
  validatePassword,
} from "../../services/adminAuthService";

const inputClassName =
  "w-full px-4 py-3 border-2 border-brand-black/10 rounded-lg focus:outline-none focus:border-brand-navy transition bg-white";

export default function AdminSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupSecret, setSignupSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAdminAuth();
  const secretRequired = getSignupSecretRequired();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (secretRequired && !signupSecret.trim()) {
      setError("Authorization code is required.");
      return;
    }

    setLoading(true);
    const result = await signup({
      name,
      email,
      password,
      signupSecret,
    });

    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <AdminAuthShell
      title="Create admin account"
      subtitle="Register to access the admin panel"
      footer={
        <p className="text-center text-sm text-brand-black/60">
          Already have an account?{" "}
          <Link
            to="/admin/login"
            className="font-semibold text-brand-navy hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="admin-signup-name"
            className="mb-2 block text-sm font-semibold text-brand-navy"
          >
            Full name
          </label>
          <input
            id="admin-signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClassName}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="admin-signup-email"
            className="mb-2 block text-sm font-semibold text-brand-navy"
          >
            Email address
          </label>
          <input
            id="admin-signup-email"
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
            htmlFor="admin-signup-password"
            className="mb-2 block text-sm font-semibold text-brand-navy"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters, mixed case & number"
              className={`${inputClassName} pr-12`}
              autoComplete="new-password"
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
          <p className="mt-1 text-xs text-brand-black/50">
            Use at least 8 characters with uppercase, lowercase, and a number.
          </p>
        </div>

        <div>
          <label
            htmlFor="admin-signup-confirm"
            className="mb-2 block text-sm font-semibold text-brand-navy"
          >
            Confirm password
          </label>
          <input
            id="admin-signup-confirm"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className={inputClassName}
            autoComplete="new-password"
            required
          />
        </div>

        {secretRequired && (
          <div>
            <label
              htmlFor="admin-signup-secret"
              className="mb-2 block text-sm font-semibold text-brand-navy"
            >
              Authorization code
            </label>
            <input
              id="admin-signup-secret"
              type="password"
              value={signupSecret}
              onChange={(e) => setSignupSecret(e.target.value)}
              placeholder="Enter the admin signup code"
              className={inputClassName}
              autoComplete="off"
              required
            />
            <p className="mt-1 text-xs text-brand-black/50">
              Provided by your site administrator. Set via{" "}
              <code className="text-brand-navy">VITE_ADMIN_SIGNUP_SECRET</code>.
            </p>
          </div>
        )}

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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AdminAuthShell>
  );
}
