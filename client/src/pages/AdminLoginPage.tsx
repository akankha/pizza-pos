import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
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
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden relative animate-fade-in">
      {/* Back Button */}
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-300 shadow-md"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Card */}
          <div className="glass dark:bg-slate-900/80 rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-200/50 dark:border-slate-800">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="relative inline-flex">
                <div className="bg-[#FF6B35] rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <ShieldCheck size={40} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-2">
                Admin Portal
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Sign in to access the dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 animate-slide-up">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-5"
            >
              {/* Username Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#FF6B35] transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Enter username"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#FF6B35] transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-12 pr-12 py-3.5 text-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#e85d2a] hover:to-[#FF6B35] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2 text-lg">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={22} />
                      Sign In
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Default credentials:{" "}
                <span className="text-slate-700 dark:text-slate-300 font-mono">
                  admin
                </span>{" "}
                /{" "}
                <span className="text-slate-700 dark:text-slate-300 font-mono">
                  admin123
                </span>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-2">
              <Lock size={14} />
              Secured with encrypted authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
