'use client';

import { useEffect, useState } from 'react';
import TouchButton from '@/components/TouchButton';
import OrderItemCard from '@/components/OrderItemCard';
import { RefreshCw } from 'lucide-react';
import type { Order } from '@/shared/types';

export default function KitchenViewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        // Filter kitchen-relevant orders
        const kitchenOrders = data.data.filter(
          (order: Order) =>
            order.status === 'pending' ||
            order.status === 'preparing' ||
            order.status === 'ready'
        );
        setOrders(kitchenOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-500';
      case 'preparing':
        return 'bg-yellow-500';
      case 'ready':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return currentStatus;
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Start Preparing';
      case 'preparing':
        return 'Mark Ready';
      case 'ready':
        return 'Complete';
      default:
        return 'Update';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-white">Loading kitchen display...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white">Kitchen Display</h1>
          <div className="flex items-center gap-4">
            <span className="text-white text-lg">{orders.length} Orders</span>
            <TouchButton onClick={fetchOrders} variant="secondary" size="sm">
              <RefreshCw size={20} />
            </TouchButton>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-gray-800 p-12 rounded-lg text-center">
            <p className="text-3xl text-gray-400">No orders in queue</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-lg border-t-8 ${getStatusColor(
                  order.status
                )}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold">#{order.orderNumber.split('-')[1]}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold">
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">
                              {item.quantity}x {item.name}
                            </h4>
                            {item.size && (
                              <p className="text-sm text-gray-600">Size: {item.size}</p>
                            )}
                            {item.crust && (
                              <p className="text-sm text-gray-600">Crust: {item.crust}</p>
                            )}
                            {item.toppings && item.toppings.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Toppings:</strong> {item.toppings.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <TouchButton
                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                    variant={order.status === 'ready' ? 'success' : 'primary'}
                    className="w-full"
                    size="lg"
                  >
                    {getActionLabel(order.status)}
                  </TouchButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
