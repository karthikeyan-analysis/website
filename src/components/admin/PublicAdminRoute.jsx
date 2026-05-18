import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export const PublicAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-navy via-brand-maroon to-brand-sky">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"
            aria-hidden="true"
          />
          <p className="font-semibold text-white">Loading…</p>
        </div>
      </div>
    );
  }

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
