import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-maroon to-brand-sky flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-brand-navy via-brand-maroon to-brand-sky rounded-xl flex items-center justify-center text-white font-bold text-xl">
                KA
              </div>
            </div>
            <h1 className="text-3xl font-bold text-brand-navy">Admin Login</h1>
            <p className="text-brand-black/60">
              Welcome to Karthikeyan Analysis Admin Panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@karthikeyan.com"
                className="w-full px-4 py-3 border-2 border-brand-black/10 rounded-lg focus:outline-none focus:border-brand-navy transition bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-brand-black/10 rounded-lg focus:outline-none focus:border-brand-navy transition bg-white"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-navy via-brand-maroon to-brand-sky text-white font-bold py-3 rounded-lg transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm space-y-1">
            <p className="font-semibold text-blue-900">Demo Credentials:</p>
            <p className="text-blue-800">
              <span className="font-semibold">Email:</span>{" "}
              admin@karthikeyan.com
            </p>
            <p className="text-blue-800">
              <span className="font-semibold">Password:</span> admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
