import { Check, Clock } from "lucide-react";
import type { Order } from "../../../shared/types";

interface KitchenOrderCardProps {
  order: Order;
  onComplete: (orderId: string) => void;
}

export default function KitchenOrderCard({
  order,
  onComplete,
}: KitchenOrderCardProps) {
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeSince = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 60000
  );

  // Determine urgency based on time
  const isUrgent = timeSince > 10;

  return (
    <div
      className={`bg-slate-800 rounded-2xl shadow-xl overflow-hidden border-2 ${
        isUrgent ? "border-red-500/50" : "border-slate-700"
      }`}
    >
      {/* Header */}
      <div className={`p-4 ${isUrgent ? "bg-red-500/10" : "bg-slate-700/50"}`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-white">
              #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              <Clock size={14} />
              <span className="text-sm">
                {orderTime} •{" "}
                <span className={isUrgent ? "text-red-400 font-semibold" : ""}>
                  {timeSince}m ago
                </span>
              </span>
            </div>
            {order.createdByName && (
              <div className="mt-1 text-sm text-slate-500">
                By: {order.createdByName}
              </div>
            )}
          </div>
          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
              order.status === "pending"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {order.status}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {order.items
          .filter((item) => item.type !== "drink")
          .map((item, index) => (
            <div key={index} className="bg-slate-700/50 rounded-xl p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-white">
                    <span className="text-[#FF6B35]">{item.quantity}x</span>{" "}
                    {item.name}
                  </h3>

                  {item.customPizza && (
                    <div className="mt-2 space-y-1 text-sm text-slate-400">
                      <p>
                        {item.customPizza.size.toUpperCase()} •{" "}
                        {item.customPizza.crust}
                      </p>

                      {item.customPizza.toppings.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customPizza.toppings.map((topping, i) => (
                            <span
                              key={i}
                              className="bg-slate-600 px-2 py-0.5 rounded text-xs text-slate-300"
                            >
                              {topping}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <p className="mt-2 text-sm text-amber-400 font-medium">
                      ⚠ {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Order notes */}
      {order.notes && (
        <div className="mx-4 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <p className="text-sm text-amber-400">
            <span className="font-semibold">Note:</span> {order.notes}
          </p>
        </div>
      )}

      {/* Complete button */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onComplete(order.id)}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        >
          <Check size={22} />
          Complete Order
        </button>
      </div>
    </div>
  );
}
