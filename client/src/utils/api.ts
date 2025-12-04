// API Configuration
// Use environment variable if available, otherwise use production URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://pizza-pos-server.vercel.app";

// Helper function to build API URLs
export function apiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Always use absolute URL with API_BASE_URL
  return `${API_BASE_URL}/${cleanPath}`;
}

// Fetch wrapper with auth token
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  return fetch(apiUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
