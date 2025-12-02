import { useNavigate } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import { useCartStore } from '../stores/cartStore';
import TouchButton from '../components/TouchButton';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';

export default function SidesAndDrinksPage() {
  const navigate = useNavigate();
  const { menuData, loading } = useMenu();
  const { addItem, items } = useCartStore();

  if (loading || !menuData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Loading menu...</div>
      </div>
    );
  }

  const handleAddItem = (item: any) => {
    addItem({
      type: item.category,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={() => navigate('/new-order')}
            variant="ghost"
            size="medium"
          >
            <ArrowLeft size={28} />
          </TouchButton>
          
          <h1 className="text-4xl font-bold text-gray-800">🍟 Sides & Drinks</h1>
          
          <TouchButton
            onClick={() => navigate('/checkout')}
            variant="ghost"
            size="medium"
            className="relative"
          >
            <ShoppingCart size={28} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF6B35] text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg">
                {items.length}
              </span>
            )}
          </TouchButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Sides */}
          <section className="mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🍟</span> Sides
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {menuData.sides.map((side) => (
                <button
                  key={side.id}
                  onClick={() => handleAddItem(side)}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 border border-gray-200 hover:border-[#FF6B35]/50 overflow-hidden"
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <div className="relative">
                  <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">🍟</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {side.name}
                  </h3>
                  {side.description && (
                    <p className="text-sm text-gray-600 mb-3">{side.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-2xl font-bold text-[#FF6B35]">
                      ${side.price.toFixed(2)}
                    </span>
                    <div className="bg-[#FF6B35] text-white rounded-full p-2 group-hover:scale-110 transition-transform shadow-md">
                      <Plus size={20} />
                    </div>
                  </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Drinks */}
          <section>
            <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🥤</span> Drinks
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {menuData.drinks.map((drink) => (
                <button
                  key={drink.id}
                  onClick={() => handleAddItem(drink)}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 border border-gray-200 hover:border-[#004E89]/50 overflow-hidden"
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <div className="relative">
                  <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">🥤</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {drink.name}
                  </h3>
                  {drink.description && (
                    <p className="text-sm text-gray-600 mb-3">{drink.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-2xl font-bold text-[#004E89]">
                      ${drink.price.toFixed(2)}
                    </span>
                    <div className="bg-[#004E89] text-white rounded-full p-2 group-hover:scale-110 transition-transform shadow-md">
                      <Plus size={20} />
                    </div>
                  </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Continue button */}
          {items.length > 0 && (
            <div className="mt-8 md:mt-12 sticky bottom-4 md:bottom-8 z-10">
              <TouchButton
                onClick={() => navigate('/checkout')}
                variant="success"
                size="large"
                className="text-lg md:text-2xl w-full shadow-2xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart size={28} />
                  <span>Continue to Checkout ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                </div>
              </TouchButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
