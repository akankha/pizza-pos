import { apiUrl } from "./api";

const isElectron = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent?.toLowerCase() || "";
  return ua.includes("electron");
};

const clientNavigate = (path: string) => {
  if (typeof window === "undefined") return;
  const targetPath = path.startsWith("/") ? path : `/${path}`;

  try {
    window.history.replaceState({}, "", targetPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } catch (error) {
    if (isElectron()) {
      window.location.reload();
    } else {
      window.location.href = targetPath;
    }
  }
};

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
      clientNavigate("/admin/login");
    } else {
      clientNavigate("/login");
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
  clientNavigate("/login");
};

// Check if app was just opened (for Electron auto-logout)
export const checkAppStartup = () => {
  if (isElectron()) {
    // Check if this is a fresh startup
    const isStartup = !sessionStorage.getItem("app-initialized");

    if (isStartup) {
      // Mark app as initialized
      sessionStorage.setItem("app-initialized", "true");

      // Force logout on startup
      logout();
      return true;
    }
  }
  return false;
};
