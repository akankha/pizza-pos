import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // Not logged in
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(userStr);
      if (!allowedRoles.includes(user.role)) {
        // Redirect kitchen staff to kitchen view
        if (user.role === "kitchen") {
          return <Navigate to="/kitchen" replace />;
        }
        // Redirect others to home
        return <Navigate to="/" replace />;
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
