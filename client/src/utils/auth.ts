import { apiUrl } from "./api";

// Helper function to make authenticated API requests
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(apiUrl(url), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  // If unauthorized, redirect to login
  if (response.status === 401 || response.status === 403) {
    const user = getCurrentUser();
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminUser");

    // Redirect based on user type
    if (user?.role === "admin") {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  return response;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

// Get current user info
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Logout function
export const logout = () => {
  // Clear all authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("adminAuth");
  localStorage.removeItem("adminUser");

  // Clear any session storage too
  sessionStorage.clear();

  // Always redirect to unified login page
  window.location.replace("/login");
};
