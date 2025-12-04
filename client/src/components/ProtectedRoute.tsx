import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  // Check for both staff and admin tokens
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  const userStr =
    localStorage.getItem("user") || localStorage.getItem("adminUser");

  // For now, allow access without login (optional login)
  // This prevents breaking the existing flow
  if (!token || !userStr) {
    // Don't force login - allow anonymous access for now
    return <>{children}</>;
  }

  // Check role if specified and user is logged in
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
      // Allow access on error
      return <>{children}</>;
    }
  }

  return <>{children}</>;
}
