import React from 'react';
import type { OrderItem } from '@/shared/types';
import { X } from 'lucide-react';

interface OrderItemCardProps {
  item: OrderItem;
  onRemove?: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
}

export default function OrderItemCard({ item, onRemove, onUpdateQuantity }: OrderItemCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
        {item.crust && <p className="text-sm text-gray-600">Crust: {item.crust}</p>}
        {item.toppings && item.toppings.length > 0 && (
          <p className="text-sm text-gray-600">Toppings: {item.toppings.join(', ')}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {onUpdateQuantity && (
            <>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span className="font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </>
          )}
          {!onUpdateQuantity && <span className="text-sm">Qty: {item.quantity}</span>}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">${item.subtotal.toFixed(2)}</p>
        {onRemove && (
          <button
            onClick={() => onRemove(item.id)}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
