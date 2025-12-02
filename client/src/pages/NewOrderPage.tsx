import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { usePizzaBuilderStore } from '../stores/pizzaBuilderStore';
import TouchButton from '../components/TouchButton';
import { Pizza, Coffee, ArrowLeft, ShoppingCart, Flame, Gift } from 'lucide-react';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const resetPizzaBuilder = usePizzaBuilderStore((state) => state.reset);

  const handleBuildPizza = () => {
    resetPizzaBuilder();
    navigate('/pizza-builder');
  };

  const categories = [
    {
      title: 'Build a Pizza',
      description: 'Create your perfect custom pizza',
      icon: Pizza,
      action: handleBuildPizza,
      gradient: 'from-[#FF6B35] to-orange-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-[#FF6B35]',
    },
    {
      title: 'Specialty Pizzas',
      description: 'Our signature gourmet pizzas',
      icon: Flame,
      action: () => navigate('/specialty-pizzas'),
      gradient: 'from-red-500 to-orange-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      title: 'Combo Deals',
      description: 'Great value family & special combos',
      icon: Gift,
      action: () => navigate('/combos'),
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Sides & Drinks',
      description: 'Wings, salads, beverages & more',
      icon: Coffee,
      action: () => navigate('/sides-drinks'),
      gradient: 'from-[#004E89] to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-[#004E89]',
    },
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <TouchButton
              onClick={() => navigate('/')}
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
              <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
              <p className="text-sm text-gray-500">Select a category</p>
            </div>
            
            <TouchButton
              onClick={() => navigate('/checkout')}
              variant="ghost"
              size="medium"
              className="relative !text-gray-700"
              aria-label={`Shopping cart with ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`}
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold" aria-hidden="true">
                    {cartItems.length}
                  </span>
                  <span className="sr-only" aria-live="polite" aria-atomic="true">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
                  </span>
                </>
              )}
            </TouchButton>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={category.action}
                aria-label={`${category.title}: ${category.description}`}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-10 md:p-12 shadow-lg hover:shadow-2xl hover:border-[#FF6B35]/50 hover:-translate-y-2 transition-all duration-300 active:scale-[0.98] overflow-hidden"
              >
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                <div className="relative flex flex-col items-center text-center gap-6">
                  {/* Icon with glow */}
                  <div className={`${category.iconBg} p-8 rounded-3xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <category.icon size={64} className={category.iconColor} strokeWidth={1.5} />
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#FF6B35] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Visual Indicator with glow */}
                  <div className="mt-4 w-full">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${category.gradient} group-hover:h-2.5 group-hover:shadow-lg transition-all duration-300`}></div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Cart Preview (if items exist) */}
          {cartItems.length > 0 && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#FF6B35]/20 p-6 shadow-lg">
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
