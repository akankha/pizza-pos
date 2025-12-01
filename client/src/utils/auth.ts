// Helper function to make authenticated API requests
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  // If unauthorized, redirect to login
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  return response;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Get current user info
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
};
