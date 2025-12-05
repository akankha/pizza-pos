import {
  BarChart3,
  Calendar,
  ChevronRight,
  Home,
  LogOut,
  Pizza,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      gradient: "from-[#FF6B35] to-orange-500",
      shadowColor: "shadow-[#FF6B35]/20",
    },
    {
      title: "User Management",
      icon: Users,
      description: "Manage staff and user roles",
      path: "/admin/users",
      gradient: "from-blue-500 to-indigo-500",
      shadowColor: "shadow-blue-500/20",
    },
    {
      title: "Sales Reports",
      icon: BarChart3,
      description: "View daily, weekly, monthly reports",
      path: "/admin/reports",
      gradient: "from-purple-500 to-pink-500",
      shadowColor: "shadow-purple-500/20",
    },
    {
      title: "Restaurant Settings",
      icon: Settings,
      description: "Configure restaurant info and taxes",
      path: "/admin/settings",
      gradient: "from-slate-500 to-slate-600",
      shadowColor: "shadow-slate-500/20",
    },
  ];

  const statCards = [
    {
      label: "Today's Sales",
      value: `$${stats.todaySales.toFixed(2)}`,
      icon: Calendar,
      gradient: "from-[#FF6B35] to-orange-500",
      bgGlow: "bg-[#FF6B35]/10",
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingBag,
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      label: "Week Sales",
      value: `$${stats.weekSales.toFixed(2)}`,
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      label: "Week Orders",
      value: stats.weekOrders,
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-500",
      bgGlow: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-800 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 shadow-md"
            >
              <Home size={20} />
              <span className="font-medium hidden sm:inline">Home</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white hidden sm:block">
                Admin Dashboard
              </h1>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 shadow-md"
            >
              <LogOut size={20} />
              <span className="font-medium hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Overview */}
          <div className="animate-slide-up">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FF6B35]" />
              Performance Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group animate-slide-up border border-slate-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                      >
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings size={18} className="text-[#FF6B35]" />
              Management Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.path}
                    onClick={() => navigate(card.path)}
                    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl text-left transition-all duration-300 hover:scale-[1.02] animate-slide-up border border-slate-200"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon size={24} className="text-white" />
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-slate-400 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2 group-hover:text-[#FF6B35] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-sm">{card.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Version Info */}
          <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <VersionInfo className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
