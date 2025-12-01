import { ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../../../shared/types";
import KitchenOrderCard from "../components/KitchenOrderCard";
import TouchButton from "../components/TouchButton";

export default function KitchenViewPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/pending");
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
      const response = await fetch(`/api/orders/${orderId}/status`, {
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
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-3xl font-bold text-brand-primary">
          Loading kitchen orders...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={() => navigate("/")}
            variant="ghost"
            size="medium"
          >
            <ArrowLeft size={28} />
          </TouchButton>

          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800">
              👨‍🍳 Kitchen Display
            </h1>
            <div
              className="w-4 h-4 rounded-full shadow-lg bg-green-400 animate-pulse"
              title="Auto-refreshing every 3 seconds"
            />
          </div>

          <TouchButton onClick={fetchOrders} variant="ghost" size="medium">
            <RefreshCw size={28} />
          </TouchButton>
        </div>
      </div>

      {/* Orders grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-full w-48 h-48 flex items-center justify-center mb-6 border-4 border-gray-200">
                <div className="text-8xl">👨‍🍳</div>
              </div>
              <h2 className="text-5xl font-bold text-gray-400">
                No pending orders
              </h2>
              <p className="text-2xl text-gray-400 mt-4">
                Orders will appear here automatically
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onComplete={handleCompleteOrder}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-lg p-6 shadow-2xl border-t border-gray-200">
        <div className="flex justify-between items-center text-lg max-w-7xl mx-auto">
          <span className="font-semibold text-gray-700">
            Active Orders:{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-3xl font-bold">
              {orders.length}
            </span>
          </span>
          <span className="text-gray-600 font-medium">
            🔄 Auto-refresh: Every 3 seconds
          </span>
        </div>
      </div>
    </div>
  );
}
