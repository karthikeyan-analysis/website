import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="text-brand-navy font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};
