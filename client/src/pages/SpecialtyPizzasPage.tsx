import { useNavigate } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import { useCartStore } from '../stores/cartStore';
import { usePizzaBuilderStore } from '../stores/pizzaBuilderStore';
import TouchButton from '../components/TouchButton';
import { ArrowLeft, ShoppingCart, Plus, Edit } from 'lucide-react';
import { useState } from 'react';
import type { PizzaSizeName, SpecialtyPizza } from '../../../shared/types';

export default function SpecialtyPizzasPage() {
  const navigate = useNavigate();
  const { menuData } = useMenu();
  const { items: cartItems, addItem } = useCartStore();
  const resetPizzaBuilder = usePizzaBuilderStore((state) => state.reset);
  const setPizzaBuilder = usePizzaBuilderStore((state) => state);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, PizzaSizeName>>({});

  const specialtyPizzas = menuData?.specialtyPizzas || [];

  const handleAddToCart = (pizzaId: string) => {
    const pizza = specialtyPizzas.find((p) => p.id === pizzaId);
    const size = selectedSizes[pizzaId] || 'medium';
    
    if (!pizza) return;

    const price = pizza.prices[size];

    addItem({
      type: 'specialty_pizza',
      name: pizza.name,
      size,
      price,
      quantity: 1,
      specialtyPizzaId: pizzaId,
      itemData: {
        name: pizza.name,
        description: pizza.description,
        toppings: pizza.toppings,
        size,
        price,
      },
    });

    // Reset selection
    setSelectedSizes((prev) => ({ ...prev, [pizzaId]: 'medium' }));
  };

  const handleCustomize = (pizza: SpecialtyPizza) => {
    const size = selectedSizes[pizza.id] || 'medium';
    
    // Extract topping names from the pizza's toppings string
    const toppingNames = pizza.toppings.split(',').map(t => t.trim());
    
    // Find matching topping IDs from menuData
    const toppingIds = menuData?.toppings
      .filter(t => toppingNames.some(name => 
        t.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(t.name.toLowerCase())
      ))
      .map(t => t.id) || [];
    
    // Set up pizza builder with specialty pizza as base
    resetPizzaBuilder();
    setPizzaBuilder.setSize(size);
    setPizzaBuilder.setCrust('regular');
    
    // Add toppings
    toppingIds.forEach(toppingId => {
      setPizzaBuilder.toggleTopping(toppingId);
    });
    
    // Navigate to pizza builder with specialty pizza context
    navigate('/pizza-builder', { 
      state: { 
        specialtyBase: pizza.name,
        specialtyId: pizza.id,
        basePrice: pizza.prices[size]
      } 
    });
  };

  const getSizeLabel = (size: PizzaSizeName): string => {
    const labels: Record<PizzaSizeName, string> = {
      small: 'S',
      medium: 'M',
      large: 'L',
      xlarge: 'XL',
    };
    return labels[size];
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <TouchButton
              onClick={() => navigate('/new-order')}
              variant="ghost"
              size="medium"
              className="!text-gray-700"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft size={24} />
                <span className="hidden sm:inline">Back</span>
              </div>
            </TouchButton>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Specialty Pizzas</h1>
              <p className="text-sm text-gray-500">{specialtyPizzas.length} signature pizzas</p>
            </div>

            <TouchButton
              onClick={() => navigate('/checkout')}
              variant="ghost"
              size="medium"
              className="relative !text-gray-700"
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartItems.length}
                </span>
              )}
            </TouchButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialtyPizzas.map((pizza) => {
              const selectedSize = selectedSizes[pizza.id] || 'medium';
              const price = pizza.prices[selectedSize];

              return (
                <div
                  key={pizza.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Pizza Header */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-600 p-4 text-white">
                    <h3 className="text-xl font-bold">{pizza.name}</h3>
            
                  </div>

                  {/* Toppings */}
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Toppings:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{pizza.toppings}</p>
                  </div>

                  {/* Size Selection */}
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Select Size:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(['small', 'medium', 'large', 'xlarge'] as PizzaSizeName[]).map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setSelectedSizes((prev) => ({ ...prev, [pizza.id]: size }))
                          }
                          className={`py-3 px-2 rounded-lg border-2 font-semibold transition-all ${
                            selectedSize === size
                              ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-xs">{getSizeLabel(size)}</div>
                          <div className="text-sm mt-1">${pizza.prices[size].toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${price.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <TouchButton
                        onClick={() => handleCustomize(pizza)}
                        variant="secondary"
                        size="large"
                        className="w-full"
                      >
                        <Edit size={18} />
                        <span>Customize</span>
                      </TouchButton>
                      <TouchButton
                        onClick={() => handleAddToCart(pizza.id)}
                        variant="primary"
                        size="large"
                        className="w-full"
                      >
                        <Plus size={18} />
                        <span>Add</span>
                      </TouchButton>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Customize to swap toppings
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Preview */}
          {cartItems.length > 0 && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#FF6B35]/20 p-6 shadow-lg sticky bottom-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                    <ShoppingCart className="text-[#FF6B35]" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
                    </p>
                    <p className="text-sm text-gray-600">Ready to checkout</p>
                  </div>
                </div>
                <TouchButton
                  onClick={() => navigate('/checkout')}
                  variant="primary"
                  size="medium"
                >
                  View Cart
                </TouchButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
