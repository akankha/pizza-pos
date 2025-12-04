import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  // Check for standardized token
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // If no roles specified, allow access (optional auth)
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // If roles are specified, require authentication
  if (!token || !userStr) {
    // Redirect to appropriate login page
    if (window.location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check role if specified and user is logged in
  try {
    const user = JSON.parse(userStr);
    if (!allowedRoles.includes(user.role)) {
      // Redirect kitchen staff to kitchen view
      if (user.role === "kitchen") {
        return <Navigate to="/kitchen" replace />;
      }
      // Redirect reception/other roles to home
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    console.error("Error parsing user data:", err);
    // On error, redirect to login for security
    if (window.location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
