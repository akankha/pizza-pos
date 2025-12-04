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

  console.log("ProtectedRoute: Checking access...");
  console.log("Token exists:", !!token);
  console.log("User string exists:", !!userStr);
  console.log("Required roles:", allowedRoles);

  // ALWAYS require authentication for protected routes
  if (!token || !userStr) {
    console.log("ProtectedRoute: No token/user, redirecting to /login");
    // Always redirect to unified login page
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log("ProtectedRoute: No role restriction, allowing access");
    return <>{children}</>;
  }

  // Check role if specified
  try {
    const user = JSON.parse(userStr);
    console.log("ProtectedRoute: User role:", user.role);
    console.log(
      "ProtectedRoute: Role allowed?",
      allowedRoles.includes(user.role)
    );

    if (!allowedRoles.includes(user.role)) {
      console.log("ProtectedRoute: Role not allowed, redirecting...");
      // Redirect kitchen staff to kitchen view
      if (user.role === "kitchen") {
        return <Navigate to="/kitchen" replace />;
      }
      // Redirect reception/other roles to home
      return <Navigate to="/" replace />;
    }

    console.log("ProtectedRoute: Access granted!");
  } catch (err) {
    console.error("ProtectedRoute: Error parsing user data:", err);
    // On error, redirect to login for security
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
