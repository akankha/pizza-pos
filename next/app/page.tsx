'use client';

import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { Pizza, Users, Clock, Settings } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">🍕 Pizza POS</h1>
          <p className="text-2xl text-white/90">Point of Sale System</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <TouchButton
            onClick={() => router.push('/new-order')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-white text-orange-600 hover:bg-orange-50"
          >
            <Pizza size={64} />
            <span className="text-2xl">New Order</span>
          </TouchButton>

          <TouchButton
            onClick={() => router.push('/active-orders')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-white text-blue-600 hover:bg-blue-50"
          >
            <Clock size={64} />
            <span className="text-2xl">Active Orders</span>
          </TouchButton>

          <TouchButton
            onClick={() => router.push('/kitchen')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-white text-green-600 hover:bg-green-50"
          >
            <Users size={64} />
            <span className="text-2xl">Kitchen Display</span>
          </TouchButton>

          <TouchButton
            onClick={() => router.push('/admin/login')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-white text-gray-700 hover:bg-gray-50"
          >
            <Settings size={64} />
            <span className="text-2xl">Admin</span>
          </TouchButton>
        </div>
      </div>
    </div>
  );
}
