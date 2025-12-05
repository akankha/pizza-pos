import {
  ChefHat,
  ClipboardList,
  LogOut,
  Pizza,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { useMenu } from "../contexts/MenuContext";
import { getCurrentUser, logout } from "../utils/auth";

export default function HomePage() {
  const navigate = useNavigate();
  const { refetch } = useMenu();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Reload user when window regains focus (in case they logged in another tab)
    const handleFocus = () => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleRefresh = () => {
    // Refetch menu data without reloading the page
    refetch();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleAdminAccess = () => {
    // Check if user is already logged in as admin
    const freshUser = getCurrentUser(); // Get fresh user data

    // Use fresh user data instead of state
    if (
      freshUser?.role === "super_admin" ||
      freshUser?.role === "restaurant_admin"
    ) {
      navigate("/admin/dashboard");
    } else {
      showToast(
        "You do not have permission to access the admin panel.",
        "error"
      );
    }
  };

  const handleNavigation = (action: (typeof mainActions)[0]) => {
    const user = getCurrentUser();

    // Check role-based access
    if (
      action.requiresAdmin &&
      user?.role !== "super_admin" &&
      user?.role !== "restaurant_admin"
    ) {
      showToast("Admin access required", "error");
      return;
    }

    if (action.requiresKitchen && user?.role === "reception") {
      showToast("Kitchen access required", "error");
      return;
    }

    if (action.requiresReception && user?.role === "kitchen") {
      showToast("Reception access required", "error");
      return;
    }

    // Navigate if allowed
    if (action.requiresAdmin) {
      handleAdminAccess();
    } else {
      navigate(action.path);
    }
  };

  const mainActions = [
    {
      title: "New Order",
      description: "Start taking customer orders",
      icon: Pizza,
      path: "/new-order",
      color: "from-[#FF6B35] to-orange-500",
      iconBg: "bg-orange-100",
      iconColor: "text-[#FF6B35]",
      requiresReception: true,
    },
    {
      title: "Active Orders",
      description: "View and manage pending orders",
      icon: ClipboardList,
      path: "/active-orders",
      color: "from-[#004E89] to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-[#004E89]",
      requiresReception: true,
    },
    {
      title: "Kitchen Display",
      description: "Real-time order preparation",
      icon: ChefHat,
      path: "/kitchen",
      color: "from-[#10B981] to-emerald-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-[#10B981]",
      requiresKitchen: true,
    },
    {
      title: "Admin Panel",
      description: "Manage menu, reports & settings",
      icon: ShieldCheck,
      path: "/admin/dashboard",
      color: "from-purple-600 to-indigo-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      requiresAdmin: true,
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300 animate-fade-in">
      {/* Modern Header */}
      <header className="glass dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-[#FF6B35] to-[#ff8555] p-3 rounded-xl shadow-lg">
                  <Pizza size={28} className="text-white" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Pizza POS
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Point of Sale System
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* User badge */}
              {currentUser && (
                <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {currentUser.full_name || currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                      {currentUser.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={handleRefresh}
                className="p-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                aria-label="Refresh menu"
              >
                <RefreshCw size={20} />
              </button>

              <button
                onClick={handleLogout}
                className="p-3 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
        <div className="max-w-5xl w-full mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-10 animate-fade-in">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              What would you like to do today?
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up">
            {mainActions.map((action, index) => {
              const user = getCurrentUser();
              const isDisabled =
                (action.requiresAdmin &&
                  user?.role !== "super_admin" &&
                  user?.role !== "restaurant_admin") ||
                (action.requiresKitchen && user?.role === "reception") ||
                (action.requiresReception && user?.role === "kitchen");

              return (
                <button
                  key={action.path}
                  onClick={() => handleNavigation(action)}
                  disabled={isDisabled}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`group relative bg-white dark:bg-slate-800/80 rounded-2xl p-6 transition-all duration-300 border border-gray-200 dark:border-slate-700 ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
                >
                  {/* Gradient glow on hover */}
                  {!isDisabled && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    ></div>
                  )}

                  <div className="relative flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div
                      className={`${
                        action.iconBg
                      } dark:bg-slate-700 p-5 rounded-2xl transition-all duration-300 ${
                        !isDisabled &&
                        "group-hover:scale-105 group-hover:shadow-lg"
                      }`}
                    >
                      <action.icon
                        size={36}
                        className={`${action.iconColor} dark:text-slate-300`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <h3
                        className={`text-lg font-bold mb-1 transition-colors duration-200 ${
                          isDisabled
                            ? "text-gray-400 dark:text-slate-500"
                            : "text-gray-900 dark:text-white group-hover:text-[#FF6B35]"
                        }`}
                      >
                        {action.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDisabled
                            ? "text-gray-400 dark:text-slate-500"
                            : "text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        {action.description}
                      </p>
                    </div>

                    {/* Bottom indicator */}
                    <div
                      className={`w-12 h-1 rounded-full bg-gradient-to-r ${
                        action.color
                      } transition-all duration-300 ${
                        !isDisabled && "group-hover:w-20"
                      }`}
                    ></div>

                    {isDisabled && (
                      <span className="absolute top-3 right-3 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                        Restricted
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status Banner */}
          <div className="mt-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                System Online • All Services Running
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass dark:bg-slate-900/80 border-t border-gray-200/50 dark:border-slate-800 py-3">
        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
          Pizza POS v2.0 • © 2025
        </p>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in border border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm">
                Are you sure you want to logout? You'll need to login again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
