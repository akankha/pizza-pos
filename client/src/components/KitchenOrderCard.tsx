import type { Order } from '../../../shared/types';
import { Clock, Check } from 'lucide-react';

interface KitchenOrderCardProps {
  order: Order;
  onComplete: (orderId: string) => void;
}

export default function KitchenOrderCard({ order, onComplete }: KitchenOrderCardProps) {
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeSince = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 60000
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-pizza-orange">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold text-pizza-red">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Clock size={20} />
            <span className="text-lg">
              {orderTime} • {timeSince} min{timeSince !== 1 ? 's' : ''} ago
            </span>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-lg font-bold ${
            order.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {order.status.toUpperCase()}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {order.items.map((item, index) => (
          <div key={index} className="bg-pizza-cream rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-pizza-brown">
                  {item.quantity}x {item.name}
                </h3>
                
                {item.customPizza && (
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-semibold text-gray-700">
                      Size: {item.customPizza.size.toUpperCase()} • Crust: {item.customPizza.crust.charAt(0).toUpperCase() + item.customPizza.crust.slice(1)}
                    </p>
                    
                    {item.customPizza.toppings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-md font-semibold text-gray-600">Toppings:</p>
                        <p className="text-lg text-gray-700">
                          {item.customPizza.toppings.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {item.notes && (
                  <p className="mt-2 text-lg text-red-600 font-semibold">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order notes */}
      {order.notes && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
          <p className="text-lg font-semibold text-yellow-900">
            Order Note: {order.notes}
          </p>
        </div>
      )}

      {/* Complete button */}
      <button
        onClick={() => onComplete(order.id)}
        className="w-full bg-pizza-green hover:bg-green-600 text-white text-2xl font-bold py-6 rounded-xl shadow-lg flex items-center justify-center gap-3 touch-target-lg active:scale-98 transition-transform"
      >
        <Check size={32} />
        Mark as Completed
      </button>
    </div>
  );
}
