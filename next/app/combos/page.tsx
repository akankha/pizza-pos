'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft } from 'lucide-react';

export default function ComboDealPage() {
  const router = useRouter();
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setCombos(data.data.combos);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (combo: any) => {
    addItem({
      type: 'combo_deal',
      name: combo.name,
      price: parseFloat(combo.price),
      quantity: 1,
    });
    router.push('/checkout');
  };

  const handleCustomize = (combo: any) => {
    router.push(`/combo-customize?id=${combo.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Combo Deals</h1>
          <TouchButton onClick={() => router.push('/new-order')} variant="secondary">
            <ArrowLeft className="inline mr-2" size={20} />
            Back
          </TouchButton>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {combos.map((combo) => (
            <div key={combo.id} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">{combo.name}</h3>
                <p className="text-3xl font-bold text-green-600 mb-3">
                  ${parseFloat(combo.price).toFixed(2)}
                </p>
                <p className="text-gray-600 mb-2">{combo.description}</p>
              </div>

              {combo.items && (
                <div className="mb-4 bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Includes:</p>
                  <p className="text-sm text-gray-600">{combo.items}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  onClick={() => handleQuickAdd(combo)}
                  variant="success"
                  className="w-full"
                >
                  Quick Add
                </TouchButton>
                <TouchButton
                  onClick={() => handleCustomize(combo)}
                  variant="secondary"
                  className="w-full"
                >
                  Customize
                </TouchButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
