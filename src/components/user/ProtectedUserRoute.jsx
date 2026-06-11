import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";

export function ProtectedUserRoute({ children }) {
  const { user, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
