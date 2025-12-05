import { ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../../../shared/types";
import KitchenOrderCard from "../components/KitchenOrderCard";
import LoadingScreen from "../components/LoadingScreen";
import { authFetch } from "../utils/api";

export default function KitchenViewPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await authFetch("/api/orders/pending");
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 3 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await authFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state immediately
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        // Refresh to sync with server
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading kitchen orders..." variant="dark" />;
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
            <div
              className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"
              title="Auto-refreshing every 3 seconds"
            />
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Orders grid */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 animate-slide-up">
              <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-5xl opacity-50">👨‍🍳</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-500">
                No pending orders
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Orders will appear here automatically
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-5 space-y-5">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className="break-inside-avoid animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <KitchenOrderCard
                    order={order}
                    onComplete={handleCompleteOrder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800/80 backdrop-blur-xl p-4 border-t border-slate-700/50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <span className="font-medium text-slate-300">
            Active Orders:{" "}
            <span className="text-2xl font-bold text-[#FF6B35]">
              {orders.length}
            </span>
          </span>
          <span className="text-sm text-slate-500 flex items-center gap-2">
            <RefreshCw
              size={14}
              className="animate-spin"
              style={{ animationDuration: "3s" }}
            />
            Auto-refresh: 3s
          </span>
        </div>
      </footer>
    </div>
  );
}
