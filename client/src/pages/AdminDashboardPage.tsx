import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Pizza,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
import VersionInfo from "../components/VersionInfo";
import { authFetch } from "../utils/api";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    weekSales: 0,
    weekOrders: 0,
    topItems: [] as any[],
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Verify token with backend
    verifyAuth();
    loadStats();
  }, [navigate]);

  const verifyAuth = async () => {
    try {
      const response = await authFetch("api/auth/verify");

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      navigate("/login");
    }
  };

  const loadStats = async () => {
    try {
      const response = await authFetch("api/admin/stats");
      const result = await response.json();
      if (result.success) {
        setStats({
          ...result.data,
          todaySales: parseFloat(result.data.todaySales) || 0,
          weekSales: parseFloat(result.data.weekSales) || 0,
          todayOrders: parseInt(result.data.todayOrders) || 0,
          weekOrders: parseInt(result.data.weekOrders) || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authFetch("api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const adminCards = [
    {
      title: "Menu Management",
      icon: Pizza,
      description: "Add, edit, or remove menu items",
      path: "/admin/menu",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "User Management",
      icon: Users,
      description: "Manage staff and user roles",
      path: "/admin/users",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      title: "Sales Reports",
      icon: BarChart3,
      description: "View daily, weekly, monthly reports",
      path: "/admin/reports",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Restaurant Settings",
      icon: Settings,
      description: "Configure restaurant info and taxes",
      path: "/admin/settings",
      gradient: "from-gray-600 to-slate-700",
    },
  ];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 shadow-2xl">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={handleLogout}
            variant="outline"
            size="medium"
            className="!bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-sm border-white/20"
          >
            <ArrowLeft size={28} />
          </TouchButton>

          <h1 className="text-4xl font-bold">🔐 Admin Dashboard</h1>

          <div className="w-24"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-orange-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-4">
                  <Calendar size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Today's Sales
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    ${stats.todaySales.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-green-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4">
                  <ShoppingBag size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Today's Orders
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.todayOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-blue-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-4">
                  <TrendingUp size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Week Sales
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ${stats.weekSales.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-purple-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
                  <BarChart3 size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">
                    Week Orders
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.weekOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Management Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.path}
                    onClick={() => navigate(card.path)}
                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-gray-200 text-left"
                  >
                    <div
                      className={`bg-gradient-to-r ${card.gradient} rounded-2xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600">{card.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Version Info */}
            <VersionInfo className="mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
