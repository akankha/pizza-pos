import {
  ChefHat,
  ClipboardList,
  Pizza,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../contexts/MenuContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { refetch } = useMenu();

  const handleRefresh = () => {
    // Refetch menu data without reloading the page
    refetch();
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
    },
    {
      title: "Active Orders",
      description: "View and manage pending orders",
      icon: ClipboardList,
      path: "/active-orders",
      color: "from-[#004E89] to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-[#004E89]",
    },
    {
      title: "Kitchen Display",
      description: "Real-time order preparation",
      icon: ChefHat,
      path: "/kitchen",
      color: "from-[#10B981] to-emerald-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-[#10B981]",
    },
    {
      title: "Admin Panel",
      description: "Manage menu, reports & settings",
      icon: ShieldCheck,
      path: "/admin/login",
      color: "from-purple-600 to-indigo-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B35] p-3 rounded-xl shadow-md">
                <Pizza size={32} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pizza POS</h1>
                <p className="text-sm text-gray-500">Point of Sale System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
                aria-label="Refresh menu"
              >
                <RefreshCw size={24} />
                <span className="font-semibold text-lg">Refresh Menu</span>
              </button>
              <div className="text-right">
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
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-xl text-gray-600">
              Select an option to get started
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                aria-label={`${action.title}: ${action.description}`}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-2xl hover:border-[#FF6B35]/50 hover:-translate-y-2 transition-all duration-300 active:scale-[0.98] overflow-hidden"
              >
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative flex flex-col items-center text-center gap-5">
                  {/* Icon with glow effect */}
                  <div
                    className={`${action.iconBg} p-6 rounded-2xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <action.icon size={48} className={action.iconColor} />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF6B35] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {/* Visual Indicator with glow */}
                  <div className="mt-2 pt-4 border-t border-gray-100 w-full">
                    <div
                      className={`h-1 rounded-full ${action.iconColor.replace(
                        "text-",
                        "bg-"
                      )} group-hover:h-2 group-hover:shadow-lg transition-all duration-300`}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Stats or Info Banner */}
          <div className="mt-12 bg-[#FF6B35]/10 rounded-card p-6 border border-[#FF6B35]/20">
            <div className="flex items-center justify-center gap-3 text-gray-900">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
              <p className="text-sm font-medium">
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
    </div>
  );
}
