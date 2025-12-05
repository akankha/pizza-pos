import { Lock, LogIn, Pizza, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnScreenKeyboard from "../components/OnScreenKeyboard";
import VersionInfo from "../components/VersionInfo";
import { apiUrl } from "../utils/api";
import { shouldShowOnScreenKeyboard } from "../utils/deviceDetection";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState<
    "username" | "password" | null
  >(null);

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
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 animate-fade-in relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <div className="glass dark:bg-slate-900/80 p-8 md:p-12 w-full max-w-md border border-gray-200/50 dark:border-slate-800 shadow-2xl rounded-3xl relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-[#FF6B35] to-orange-600 p-5 rounded-2xl shadow-lg shadow-orange-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Pizza size={48} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 dark:text-slate-400 mb-8 font-medium">
          Sign in to access the POS system
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 font-medium text-sm flex items-center gap-2 animate-slide-up">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Username
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-[#FF6B35] transition-colors"
                size={20}
              />
              <input
                type="text"
                value={username}
                onFocus={() => {
                  if (shouldShowOnScreenKeyboard()) {
                    setActiveField("username");
                    setShowKeyboard(true);
                  }
                }}
                onChange={
                  shouldShowOnScreenKeyboard()
                    ? undefined
                    : (e) => setUsername(e.target.value)
                }
                readOnly={shouldShowOnScreenKeyboard()}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all cursor-text"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-[#FF6B35] transition-colors"
                size={20}
              />
              <input
                type="password"
                value={password}
                onFocus={() => {
                  if (shouldShowOnScreenKeyboard()) {
                    setActiveField("password");
                    setShowKeyboard(true);
                  }
                }}
                onChange={
                  shouldShowOnScreenKeyboard()
                    ? undefined
                    : (e) => setPassword(e.target.value)
                }
                readOnly={shouldShowOnScreenKeyboard()}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all cursor-text"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#e85d2a] hover:to-[#FF6B35] text-white py-4 px-8 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn size={22} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Version Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
          <VersionInfo className="justify-center opacity-60 hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* On-Screen Keyboard */}
      {showKeyboard && activeField && shouldShowOnScreenKeyboard() && (
        <OnScreenKeyboard
          currentValue={activeField === "username" ? username : password}
          onInput={(value) => {
            if (activeField === "username") {
              setUsername(value);
            } else {
              setPassword(value);
            }
          }}
          onClose={() => {
            setShowKeyboard(false);
            setActiveField(null);
          }}
          isNumeric={false}
          isPassword={activeField === "password"}
        />
      )}
    </div>
  );
}
