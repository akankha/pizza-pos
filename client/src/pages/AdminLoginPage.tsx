import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
import { apiUrl } from "../utils/api";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Store token in localStorage as backup
        // Use standardized token keys
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/admin/dashboard");
      } else {
        setError(result.error || "Login failed");
        setPassword("");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      {/* Back Button */}
      <div className="p-6">
        <TouchButton
          onClick={() => navigate("/")}
          variant="ghost"
          size="medium"
        >
          <ArrowLeft size={28} />
        </TouchButton>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-card p-12 shadow-hard border-2 border-gray-200 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-brand-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck
                size={40}
                className="text-white"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">Enter your credentials</p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-50 border-2 border-red-500 text-red-700 rounded-xl px-4 py-3 mb-6"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Username Input */}
            <div className="mb-6">
              <label
                htmlFor="admin-username"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white text-gray-800 border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="admin"
                autoFocus
                disabled={loading}
                required
                aria-required="true"
                aria-invalid={!!error}
              />
            </div>

            {/* Password Input */}
            <div className="mb-8">
              <label
                htmlFor="admin-password"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white text-gray-800 border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="••••••••"
                disabled={loading}
                required
                aria-required="true"
                aria-invalid={!!error}
              />
            </div>

            {/* Login Button */}
            <TouchButton
              onClick={handleSubmit}
              variant="primary"
              size="large"
              disabled={loading}
              fullWidth
              aria-label={
                loading ? "Logging in, please wait" : "Login to admin panel"
              }
            >
              {loading ? "Logging in..." : "Login"}
            </TouchButton>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Default: admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
