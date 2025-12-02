'use client';

import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { Pizza, Package, Wine, Gift } from 'lucide-react';

export default function NewOrderPage() {
  const router = useRouter();

  const categories = [
    {
      title: 'Build Your Own Pizza',
      description: 'Choose size, crust & toppings',
      icon: Pizza,
      color: 'orange',
      path: '/pizza-builder',
    },
    {
      title: 'Specialty Pizzas',
      description: '11 signature pizzas',
      icon: Gift,
      color: 'red',
      path: '/specialty-pizzas',
    },
    {
      title: 'Combo Deals',
      description: 'Value combo meals',
      icon: Package,
      color: 'green',
      path: '/combos',
    },
    {
      title: 'Sides & Drinks',
      description: 'Wings, fries, drinks & more',
      icon: Wine,
      color: 'blue',
      path: '/sides-and-drinks',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">New Order</h1>
          <TouchButton onClick={() => router.push('/')} variant="secondary">
            Back to Home
          </TouchButton>
        </div>

        <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {categories.map((category) => (
            <TouchButton
              key={category.path}
              onClick={() => router.push(category.path)}
              variant="primary"
              size="lg"
              className={`h-64 flex flex-col items-center justify-center gap-4 bg-${category.color}-600 hover:bg-${category.color}-700`}
            >
              <category.icon size={80} />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
                <p className="text-lg opacity-90">{category.description}</p>
              </div>
            </TouchButton>
          ))}
        </div>
      </div>
    </div>
  );
}
