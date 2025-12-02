'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft } from 'lucide-react';

export default function SidesAndDrinksPage() {
  const router = useRouter();
  const [sides, setSides] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
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
        setSides(data.data.sides);
        setDrinks(data.data.drinks);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: any, type: 'side' | 'drink') => {
    addItem({
      type,
      name: item.name,
      price: parseFloat(item.price),
      quantity: 1,
    });
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
          <h1 className="text-4xl font-bold">Sides & Drinks</h1>
          <div className="flex gap-3">
            <TouchButton onClick={() => router.push('/checkout')} variant="success">
              Go to Checkout
            </TouchButton>
            <TouchButton onClick={() => router.push('/new-order')} variant="secondary">
              <ArrowLeft className="inline mr-2" size={20} />
              Back
            </TouchButton>
          </div>
        </div>

        {/* Sides Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Sides</h2>
          <div className="grid grid-cols-3 gap-4">
            {sides.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                  <TouchButton
                    onClick={() => handleAddToCart(item, 'side')}
                    variant="primary"
                    size="sm"
                  >
                    Add
                  </TouchButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drinks Section */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Drinks</h2>
          <div className="grid grid-cols-3 gap-4">
            {drinks.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                  <TouchButton
                    onClick={() => handleAddToCart(item, 'drink')}
                    variant="primary"
                    size="sm"
                  >
                    Add
                  </TouchButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
