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

  // ALWAYS require authentication for protected routes
  if (!token || !userStr) {
    // Always redirect to unified login page
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check role if specified
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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
