'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { usePizzaBuilderStore } from '@/stores/pizzaBuilderStore';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft, Check } from 'lucide-react';

interface MenuData {
  sizes: any[];
  crusts: any[];
  toppings: any[];
}

export default function PizzaBuilderPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { size, crust, toppings, setSize, setCrust, toggleTopping, reset } = usePizzaBuilderStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setMenu(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!size || !crust) {
      alert('Please select size and crust');
      return;
    }

    const selectedSize = menu?.sizes.find((s: any) => s.size === size);
    const basePrice = selectedSize?.price || 0;
    const toppingPrice = 1.5;
    const totalPrice = basePrice + (toppings.length * toppingPrice);

    addItem({
      type: 'custom_pizza',
      name: 'Custom Pizza',
      price: totalPrice,
      quantity: 1,
      size,
      crust,
      toppings,
    });

    reset();
    router.push('/checkout');
  };

  const maxToppings = size === 'Small' ? 3 : size === 'Medium' ? 5 : size === 'Large' ? 7 : 10;
  const canAddMoreToppings = toppings.length < maxToppings;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Build Your Pizza</h1>
          <TouchButton onClick={() => router.push('/new-order')} variant="secondary">
            <ArrowLeft className="inline mr-2" size={20} />
            Back
          </TouchButton>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Size Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">1. Select Size</h2>
            <div className="space-y-3">
              {menu?.sizes.map((s: any) => (
                <TouchButton
                  key={s.size}
                  onClick={() => setSize(s.size)}
                  variant={size === s.size ? 'primary' : 'secondary'}
                  className="w-full justify-between"
                >
                  <span>{s.size}</span>
                  <span>${s.price.toFixed(2)}</span>
                </TouchButton>
              ))}
            </div>
          </div>

          {/* Crust Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">2. Select Crust</h2>
            <div className="space-y-3">
              {menu?.crusts.map((c: any) => (
                <TouchButton
                  key={c.type}
                  onClick={() => setCrust(c.type)}
                  variant={crust === c.type ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {c.type}
                </TouchButton>
              ))}
            </div>
          </div>

          {/* Toppings Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">
              3. Select Toppings ({toppings.length}/{maxToppings})
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {menu?.toppings.map((t: any) => {
                const isSelected = toppings.includes(t.name);
                const canSelect = canAddMoreToppings || isSelected;
                
                return (
                  <button
                    key={t.id}
                    onClick={() => canSelect && toggleTopping(t.name)}
                    disabled={!canSelect}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : canSelect
                        ? 'bg-gray-100 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{t.name}</span>
                      {isSelected && <Check size={20} />}
                    </div>
                    <div className="text-xs opacity-75 mt-1">{t.category}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary and Add to Cart */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Your Pizza</h3>
              <p className="text-gray-600">
                {size || 'No size'} • {crust || 'No crust'} • {toppings.length} toppings
              </p>
              {toppings.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {toppings.join(', ')}
                </p>
              )}
            </div>
            <TouchButton
              onClick={handleAddToCart}
              variant="success"
              size="lg"
              disabled={!size || !crust}
            >
              Add to Cart
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  );
}
