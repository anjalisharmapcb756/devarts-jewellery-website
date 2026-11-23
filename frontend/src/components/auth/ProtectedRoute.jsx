import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  if (!user) return <Navigate to={admin ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  if (admin && user.role !== "admin") return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return children;
}
