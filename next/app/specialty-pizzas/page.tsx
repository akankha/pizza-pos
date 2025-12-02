'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft } from 'lucide-react';

export default function SpecialtyPizzasPage() {
  const router = useRouter();
  const [specialtyPizzas, setSpecialtyPizzas] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
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
        setSpecialtyPizzas(data.data.specialtyPizzas);
        setSizes(data.data.sizes);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (pizza: any, selectedSize: string) => {
    const sizeData = sizes.find((s: any) => s.size === selectedSize);
    const price = sizeData?.price || 0;

    addItem({
      type: 'specialty_pizza',
      name: pizza.name,
      price: price + 2, // Specialty pizza premium
      quantity: 1,
      size: selectedSize,
      toppings: pizza.toppings ? JSON.parse(pizza.toppings) : [],
    });

    router.push('/checkout');
  };

  const handleCustomize = (pizza: any) => {
    // Navigate to pizza builder with pre-filled toppings
    router.push(`/pizza-builder?specialty=${pizza.id}`);
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
          <h1 className="text-4xl font-bold">Specialty Pizzas</h1>
          <TouchButton onClick={() => router.push('/new-order')} variant="secondary">
            <ArrowLeft className="inline mr-2" size={20} />
            Back
          </TouchButton>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {specialtyPizzas.map((pizza) => (
            <div key={pizza.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-2xl font-bold mb-2">{pizza.name}</h3>
              <p className="text-gray-600 mb-4">{pizza.description}</p>
              
              {pizza.toppings && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Toppings:</p>
                  <p className="text-sm text-gray-600">
                    {JSON.parse(pizza.toppings).join(', ')}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Size:</p>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <TouchButton
                      key={size.size}
                      onClick={() => handleAddToCart(pizza, size.size)}
                      variant="primary"
                      size="sm"
                    >
                      {size.size} - ${(size.price + 2).toFixed(2)}
                    </TouchButton>
                  ))}
                </div>
              </div>

              <TouchButton
                onClick={() => handleCustomize(pizza)}
                variant="secondary"
                className="w-full"
              >
                Customize Toppings
              </TouchButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
