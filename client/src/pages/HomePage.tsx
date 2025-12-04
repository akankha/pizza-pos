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
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Modern Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B35] p-2 sm:p-3 rounded-xl shadow-md">
                <Pizza
                  size={28}
                  className="sm:w-8 sm:h-8 text-white"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Pizza POS
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Point of Sale System
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Current User Display */}
              {currentUser && (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <User
                    size={18}
                    className="sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300"
                  />
                  <div className="text-xs sm:text-sm">
                    <p className="font-semibold text-gray-800">
                      {currentUser.full_name || currentUser.username}
                    </p>
                    <p className="text-gray-600 capitalize text-xs">
                      {currentUser.role}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md text-sm sm:text-base"
                aria-label="Refresh menu"
              >
                <RefreshCw size={20} className="sm:w-6 sm:h-6" />
                <span className="font-semibold">Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md text-sm sm:text-base"
                aria-label="Logout"
              >
                <LogOut size={20} className="sm:w-6 sm:h-6" />
                <span className="font-semibold">Logout</span>
              </button>

              <div className="text-center sm:text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-600">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl w-full mx-auto min-h-full flex flex-col justify-center">
          {/* Welcome Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
              Welcome Back
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Select an option to get started
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mainActions.map((action) => {
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
                  aria-label={`${action.title}: ${action.description}`}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl border-2 p-8 transition-all duration-200 shadow-md ${
                    isDisabled
                      ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                      : "border-gray-300 dark:border-gray-600 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-5">
                    {/* Icon */}
                    <div
                      className={`${
                        action.iconBg
                      } p-6 rounded-xl transition-transform duration-200 ${
                        !isDisabled && "group-hover:scale-110"
                      }`}
                    >
                      <action.icon
                        size={52}
                        className={action.iconColor}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <h3
                        className={`text-xl font-bold mb-2 transition-colors ${
                          isDisabled
                            ? "text-gray-400 dark:text-gray-500"
                            : "text-gray-900 dark:text-white group-hover:text-[#FF6B35]"
                        }`}
                      >
                        {action.title}
                      </h3>
                      <p
                        className={`text-sm font-medium ${
                          isDisabled
                            ? "text-gray-400 dark:text-gray-600"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {action.description}
                      </p>
                      {isDisabled && (
                        <p className="text-xs text-red-500 mt-2 font-semibold">
                          🔒 Access Restricted
                        </p>
                      )}
                    </div>

                    {/* Visual Indicator */}
                    <div className="mt-2 pt-3 border-t border-gray-200 w-full">
                      <div
                        className={`h-2 rounded-full ${action.iconColor.replace(
                          "text-",
                          "bg-"
                        )} group-hover:h-2.5 transition-all duration-200`}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats or Info Banner */}
          <div className="mt-8 bg-green-50 rounded-xl p-5 border-2 border-green-400 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-gray-900">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-base font-bold">
                System Ready • All Services Online
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500">
            Pizza POS v2.0 • © 2025 All Rights Reserved
          </p>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <LogOut className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to logout? You'll need to login again to
                access the system.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelLogout}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
