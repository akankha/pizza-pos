import { ArrowLeft, Clock, FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../../../shared/types";
import LoadingScreen from "../components/LoadingScreen";
import { apiUrl, authFetch } from "../utils/api";

export default function ActiveOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await authFetch("/api/orders/pending");
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading orders..." />;
  }

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Active Orders
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {orders.length} order{orders.length !== 1 ? "s" : ""} pending
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          >
            <RefreshCw
              size={18}
              className="animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </button>
        </div>
      </header>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {orders.length === 0 ? (
            <div className="text-center py-20 animate-slide-up">
              <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText
                  size={32}
                  className="text-gray-400 dark:text-slate-500"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-400 dark:text-slate-500">
                No Active Orders
              </h2>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">
                All caught up!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden animate-slide-up hover:shadow-md transition-shadow flex flex-col h-[420px]"
                >
                  {/* Order Header */}
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-slate-400">
                          <Clock size={12} />
                          <span>{formatTime(order.createdAt)}</span>
                          {order.createdByName && (
                            <>
                              <span className="text-gray-300 dark:text-slate-600">
                                •
                              </span>
                              <span>By: {order.createdByName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-xs font-semibold uppercase tracking-wide">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-5 py-3 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start py-1"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 dark:text-slate-300">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.quantity}x
                              </span>{" "}
                              {item.name}
                            </span>
                            {item.customPizza && (
                              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                                {item.customPizza.size} •{" "}
                                {item.customPizza.crust}
                                {item.customPizza.toppings.length > 0 &&
                                  ` • ${item.customPizza.toppings.length} toppings`}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-[#FF6B35] ml-3 whitespace-nowrap">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 mt-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </span>
                      {order.paymentMethod && (
                        <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        window.open(
                          apiUrl(`/api/orders/${order.id}/receipt/pdf`),
                          "_blank"
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] rounded-xl text-sm font-medium transition-colors"
                    >
                      <FileText size={16} />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
