'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import OrderItemCard from '@/components/OrderItemCard';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import type { Order } from '@/shared/types';

export default function ActiveOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        // Filter only pending and preparing orders
        const activeOrders = data.data.filter(
          (order: Order) => order.status === 'pending' || order.status === 'preparing'
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Active Orders</h1>
            <p className="text-gray-600 mt-2">{orders.length} active orders</p>
          </div>
          <TouchButton onClick={() => router.push('/')} variant="secondary">
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Home
          </TouchButton>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
            <p className="text-2xl text-gray-500 mb-2">No active orders</p>
            <p className="text-gray-400">All orders have been completed</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <OrderItemCard key={item.id} item={item} />
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-xl font-bold">Total: ${order.total.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock size={16} className="mr-1" />
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
