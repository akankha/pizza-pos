import { Lock, LogIn, Pizza, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Store user info and token
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Redirect based on role
        if (result.data.user.role === "kitchen") {
          navigate("/kitchen");
        } else {
          navigate("/");
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#FF6B35] p-6 rounded-full shadow-lg">
            <Pizza size={64} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Staff Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to access the POS system
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={24}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={24}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-2xl text-2xl font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
          >
            <LogIn size={28} />
            <span className="text-2xl font-bold">
              {loading ? "Signing In..." : "Sign In"}
            </span>
          </button>
        </form>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/admin/login")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
}
