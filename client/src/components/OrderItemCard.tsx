import { Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { OrderItem } from "../../../shared/types";

interface OrderItemCardProps {
  item: OrderItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function OrderItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: OrderItemCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleRemoveClick = () => {
    setIsConfirming(true);
  };

  const handleConfirmRemove = () => {
    onRemove(item.id);
    setIsConfirming(false);
  };

  const handleCancelRemove = () => {
    setIsConfirming(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {item.name}
          </h3>

          {item.customPizza && (
            <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              <p>
                {item.customPizza.size.charAt(0).toUpperCase() +
                  item.customPizza.size.slice(1)}{" "}
                •{" "}
                {item.customPizza.crust.charAt(0).toUpperCase() +
                  item.customPizza.crust.slice(1)}{" "}
                Crust
              </p>
              {item.customPizza.toppings.length > 0 && (
                <p className="text-xs mt-0.5">
                  {item.customPizza.toppings.length} topping
                  {item.customPizza.toppings.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {item.notes && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 italic">
              {item.notes}
            </p>
          )}

          <p className="text-base font-bold text-[#FF6B35] mt-1">
            ${item.price.toFixed(2)}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={18} />
          </button>

          <span className="text-lg font-bold w-8 text-center text-gray-800 dark:text-white">
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemoveClick}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isConfirming && (
        <div className="mt-4 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/70 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-200">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-200">
              <Trash2 size={14} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Remove this item?</p>
              <p className="text-xs text-red-600/80 dark:text-red-200/80">
                {item.name}
              </p>
            </div>
            <button
              onClick={handleCancelRemove}
              className="text-red-400 hover:text-red-500 transition-colors"
              aria-label="Cancel removal"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleConfirmRemove}
              className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-600"
            >
              Remove Item
            </button>
            <button
              onClick={handleCancelRemove}
              className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100/60 dark:border-red-900/40 dark:text-red-200 dark:hover:bg-red-900/30"
            >
              Keep Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
