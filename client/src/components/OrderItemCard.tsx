import type { OrderItem } from '../../../shared/types';
import { Trash2, Plus, Minus } from 'lucide-react';
import TouchButton from './TouchButton';

interface OrderItemCardProps {
  item: OrderItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function OrderItemCard({ item, onUpdateQuantity, onRemove }: OrderItemCardProps) {
  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200 hover:border-[#FF6B35]/30 hover:shadow-xl transition-all duration-200 flex items-center gap-4 overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative flex-1">
        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
        
        {item.customPizza && (
          <div className="mt-1 text-sm text-gray-600">
            <p className="font-semibold">
              {item.customPizza.size.charAt(0).toUpperCase() + item.customPizza.size.slice(1)} • {' '}
              {item.customPizza.crust.charAt(0).toUpperCase() + item.customPizza.crust.slice(1)} Crust
            </p>
            {item.customPizza.toppings.length > 0 && (
              <p className="text-xs mt-1">
                {item.customPizza.toppings.length} topping{item.customPizza.toppings.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
        
        {item.notes && (
          <p className="text-sm text-gray-500 mt-1 italic">{item.notes}</p>
        )}
        
        <p className="text-lg font-bold text-[#FF6B35] mt-2">
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="relative flex items-center gap-3">
        <TouchButton
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          variant="ghost"
          size="small"
          aria-label="Decrease quantity"
        >
          <Minus size={20} aria-hidden="true" />
        </TouchButton>
        
        <span className="text-2xl font-bold w-12 text-center" aria-live="polite">
          {item.quantity}
        </span>
        
        <TouchButton
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          variant="ghost"
          size="small"
          aria-label="Increase quantity"
        >
          <Plus size={20} aria-hidden="true" />
        </TouchButton>
      </div>

      {/* Remove button */}
      <div className="relative">
      <TouchButton
        onClick={() => {
          if (confirm(`Remove ${item.name} from cart?`)) {
            onRemove(item.id);
          }
        }}
        variant="ghost"
        size="small"
        className="!text-red-500 hover:!bg-red-50"
        aria-label={`Remove ${item.name} from cart`}
      >
        <Trash2 size={24} aria-hidden="true" />
      </TouchButton>
      </div>
    </div>
  );
}
