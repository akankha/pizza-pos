import { useNavigate, useLocation } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import { useCartStore } from '../stores/cartStore';
import TouchButton from '../components/TouchButton';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ComboDeal, PizzaSizeName } from '../../../shared/types';

interface PizzaCustomization {
  size: PizzaSizeName;
  toppings: string[];
  maxToppings: number;
}

interface ComboCustomization {
  pizzas: PizzaCustomization[];
  selectedWingFlavor?: string;
  selectedDrink?: string;
  selectedSides?: string[];
}

export default function ComboCustomizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuData } = useMenu();
  const { addItem } = useCartStore();
  
  const combo = location.state?.combo as ComboDeal | undefined;
  
  const [customization, setCustomization] = useState<ComboCustomization>({
    pizzas: [],
  });

  const toppings = menuData?.toppings || [];
  const wingFlavors = ['Mild', 'Medium', 'Hot', 'Honey Garlic', 'BBQ', 'Salt & Pepper', 'Teriyaki'];

  useEffect(() => {
    if (!combo) {
      navigate('/combos');
      return;
    }

    // Parse combo items to determine pizza count and sizes
    const pizzaMatches = combo.items.match(/(\d+)\s*(Small|Medium|Large|X-?Large)\s*Pizza/gi) || [];
    const initialPizzas: PizzaCustomization[] = pizzaMatches.map(match => {
      const sizeMatch = match.match(/(Small|Medium|Large|X-?Large)/i);
      let size: PizzaSizeName = 'medium';
      
      if (sizeMatch) {
        const sizeStr = sizeMatch[1].toLowerCase().replace('-', '');
        if (sizeStr === 'small') size = 'small';
        else if (sizeStr === 'medium') size = 'medium';
        else if (sizeStr === 'large') size = 'large';
        else if (sizeStr === 'xlarge' || sizeStr === 'xlarge') size = 'xlarge';
      }

      // Extract max toppings from combo description
      const toppingMatch = match.match(/\((\d+)\s*topping/i);
      const maxToppings = toppingMatch ? parseInt(toppingMatch[1]) : 3;

      return {
        size,
        toppings: [],
        maxToppings,
      };
    });

    setCustomization({ pizzas: initialPizzas });
  }, [combo, navigate]);

  if (!combo) return null;

  const toggleTopping = (pizzaIndex: number, toppingId: string) => {
    setCustomization(prev => {
      const newPizzas = [...prev.pizzas];
      const pizza = newPizzas[pizzaIndex];
      
      if (pizza.toppings.includes(toppingId)) {
        pizza.toppings = pizza.toppings.filter(id => id !== toppingId);
      } else if (pizza.toppings.length < pizza.maxToppings) {
        pizza.toppings.push(toppingId);
      }
      
      return { ...prev, pizzas: newPizzas };
    });
  };

  const handleAddToCart = () => {
    const pizzaDetails = customization.pizzas.map((pizza, idx) => {
      const selectedToppings = pizza.toppings
        .map(id => toppings.find(t => t.id === id)?.name)
        .filter(Boolean);
      
      return `Pizza ${idx + 1} (${pizza.size}): ${selectedToppings.join(', ') || 'No toppings'}`;
    });

    const customizationDetails = {
      ...customization,
      pizzaDetails,
    };

    addItem({
      type: 'combo_deal',
      name: combo.name,
      price: combo.price,
      quantity: 1,
      comboId: combo.id,
      itemData: {
        name: combo.name,
        description: combo.description,
        items: combo.items,
        price: combo.price,
        customization: customizationDetails,
      },
    });

    navigate('/checkout');
  };

  const allPizzasComplete = customization.pizzas.every(
    pizza => pizza.toppings.length > 0 && pizza.toppings.length <= pizza.maxToppings
  );

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <TouchButton
              onClick={() => navigate('/combos')}
              variant="ghost"
              size="medium"
              className="!text-gray-700"
            >
              <ArrowLeft size={24} />
            </TouchButton>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{combo.name}</h1>
              <p className="text-sm text-gray-500">{combo.description}</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${combo.price.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Fixed Price</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Included Items Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Includes:</h3>
            <p className="text-sm text-gray-600">{combo.items}</p>
          </div>

          {/* Pizza Customizations */}
          {customization.pizzas.map((pizza, pizzaIndex) => (
            <div key={pizzaIndex} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Pizza {pizzaIndex + 1} - {pizza.size.charAt(0).toUpperCase() + pizza.size.slice(1)}
                </h3>
                <div className="text-sm font-medium text-gray-600">
                  {pizza.toppings.length} / {pizza.maxToppings} toppings
                </div>
              </div>

              {/* Topping Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {toppings.map((topping) => {
                  const isSelected = pizza.toppings.includes(topping.id);
                  const isDisabled = !isSelected && pizza.toppings.length >= pizza.maxToppings;

                  return (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(pizzaIndex, topping.id)}
                      disabled={isDisabled}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-md'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{topping.name}</span>
                        {isSelected && <Check size={16} />}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                        {topping.category}
                      </div>
                    </button>
                  );
                })}
              </div>

              {pizza.toppings.length === 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    Please select at least 1 topping for this pizza
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Wing Flavor Selection (if combo includes wings) */}
          {combo.items.toLowerCase().includes('wing') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Wing Flavor</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {wingFlavors.map((flavor) => {
                  const isSelected = customization.selectedWingFlavor === flavor;
                  return (
                    <button
                      key={flavor}
                      onClick={() =>
                        setCustomization(prev => ({ ...prev, selectedWingFlavor: flavor }))
                      }
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{flavor}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Add to Cart */}
      <footer className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <TouchButton
            onClick={handleAddToCart}
            disabled={!allPizzasComplete}
            variant="primary"
            size="large"
            className="w-full"
          >
            <Plus size={24} />
            <span>Add Combo to Cart - ${combo.price.toFixed(2)}</span>
          </TouchButton>
          {!allPizzasComplete && (
            <p className="text-sm text-orange-600 text-center mt-2">
              Please select toppings for all pizzas
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
