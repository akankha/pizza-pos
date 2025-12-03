import { ArrowLeft, CheckCircle, Clock, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
import { apiUrl } from "../utils/api";

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

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
      const response = await fetch(apiUrl("/api/orders/pending"));
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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-3xl font-bold text-[#FF6B35]">
          Loading orders...
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

          <h1 className="text-4xl font-bold text-gray-800">📋 Active Orders</h1>

          <div className="w-24"></div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/50 backdrop-blur-sm rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 border-4 border-gray-200">
                <div className="text-6xl">📋</div>
              </div>
              <h2 className="text-4xl font-bold text-gray-400">
                No Active Orders
              </h2>
              <p className="text-xl text-gray-400 mt-2">All caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:border-[#FF6B35]/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="relative">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-md ${
                          order.status === "pending"
                            ? "bg-[#F59E0B] text-white"
                            : order.status === "preparing"
                            ? "bg-[#004E89] text-white"
                            : "bg-[#10B981] text-white"
                        }`}
                      >
                        {order.status === "pending" && (
                          <Clock size={16} aria-hidden="true" />
                        )}
                        {order.status === "ready" && (
                          <CheckCircle size={16} aria-hidden="true" />
                        )}
                        <span>{order.status.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-800">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-bold text-[#FF6B35]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {item.customPizza && (
                            <div className="ml-4 text-xs text-gray-500 mt-1 space-y-0.5">
                              <div>• Size: {item.customPizza.size}</div>
                              <div>• Crust: {item.customPizza.crust}</div>
                              {item.customPizza.toppings.length > 0 && (
                                <div>
                                  • Toppings: {item.customPizza.toppings.length}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-2xl font-bold text-[#FF6B35]">
                          ${order.total.toFixed(2)}
                        </div>
                        {order.paymentMethod && (
                          <div className="text-sm font-semibold text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                            {order.paymentMethod}
                          </div>
                        )}
                      </div>

                      {/* Receipt Button */}
                      <TouchButton
                        onClick={() =>
                          window.open(
                            apiUrl(`/api/orders/${order.id}/receipt/pdf`),
                            "_blank"
                          )
                        }
                        variant="secondary"
                        size="medium"
                        fullWidth
                        aria-label={`View receipt for order ${order.id.slice(
                          0,
                          8
                        )}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Receipt size={18} aria-hidden="true" />
                          <span>View Receipt</span>
                        </div>
                      </TouchButton>
                    </div>
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
