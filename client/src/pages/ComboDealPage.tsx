import { useNavigate } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import { useCartStore } from '../stores/cartStore';
import TouchButton from '../components/TouchButton';
import { ArrowLeft, ShoppingCart, Plus, Gift, Settings } from 'lucide-react';

export default function ComboDealPage() {
  const navigate = useNavigate();
  const { menuData } = useMenu();
  const { items: cartItems, addItem } = useCartStore();

  const combos = menuData?.combos || [];

  // Group combos by category
  const groupedCombos = combos.reduce((acc, combo) => {
    const category = combo.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(combo);
    return acc;
  }, {} as Record<string, typeof combos>);

  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      'pizza-special': 'Pizza Specials',
      'walk-in': 'Walk-In Specials',
      'family-special': 'Family Specials',
      'daily-special': 'Daily Specials',
      'other': 'Other Combos',
    };
    return titles[category] || category;
  };

  const handleAddToCart = (comboId: string) => {
    const combo = combos.find((c) => c.id === comboId);
    if (!combo) return;

    addItem({
      type: 'combo_deal',
      name: combo.name,
      price: combo.price,
      quantity: 1,
      comboId: comboId,
      itemData: {
        name: combo.name,
        description: combo.description,
        items: combo.items,
        price: combo.price,
      },
    });
  };

  const handleCustomize = (comboId: string) => {
    const combo = combos.find((c) => c.id === comboId);
    if (!combo) return;
    
    navigate('/combo-customize', { state: { combo } });
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
              <h1 className="text-2xl font-bold text-gray-900">Combo Deals</h1>
              <p className="text-sm text-gray-500">{combos.length} great value combos</p>
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
        <div className="max-w-7xl mx-auto space-y-8">
          {Object.entries(groupedCombos).map(([category, categoryCombo]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Gift className="text-purple-500" size={28} />
                  {getCategoryTitle(category)}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2"></div>
              </div>

              {/* Combos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCombo.map((combo) => (
                  <div
                    key={combo.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    {/* Combo Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{combo.name}</h3>
                          
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-2xl font-bold">${combo.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Included Items */}
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-3">Includes:</p>
                      <div className="space-y-2">
                        {combo.items.split(',').map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.trim()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add to Cart */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Total Price:</span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${combo.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <TouchButton
                          onClick={() => handleCustomize(combo.id)}
                          variant="secondary"
                          size="large"
                          className="w-full"
                        >
                          <Settings size={18} />
                          <span>Customize</span>
                        </TouchButton>
                        <TouchButton
                          onClick={() => handleAddToCart(combo.id)}
                          variant="primary"
                          size="large"
                          className="w-full"
                        >
                          <Plus size={18} />
                          <span>Quick Add</span>
                        </TouchButton>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Customize to select toppings & flavors
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
      </main>
    </div>
  );
}
