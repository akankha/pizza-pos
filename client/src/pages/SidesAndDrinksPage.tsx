import { ArrowLeft, Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useMenu } from "../contexts/MenuContext";
import { useCartStore } from "../stores/cartStore";

export default function SidesAndDrinksPage() {
  const navigate = useNavigate();
  const { menuData, loading } = useMenu();
  const { addItem, items } = useCartStore();

  // Show loading screen while loading
  if (loading || !menuData) {
    return <LoadingScreen message="Loading menu..." />;
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
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="glass dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-800 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/new-order")}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Sides & Drinks
            </h1>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="relative p-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
          >
            <ShoppingCart size={22} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8555] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Sides */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4 uppercase tracking-wide flex items-center gap-2">
              <span>🍟</span> Sides
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuData.sides.map((side, index) => (
                <button
                  key={side.id}
                  onClick={() => handleAddItem(side)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 hover:border-[#FF6B35] dark:hover:border-[#FF6B35] hover:-translate-y-1 animate-slide-up text-left"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    🍟
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                    {side.name}
                  </h3>
                  {side.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                      {side.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-lg font-bold text-[#FF6B35]">
                      ${side.price.toFixed(2)}
                    </span>
                    <div className="bg-[#FF6B35] text-white rounded-lg p-1.5 group-hover:scale-110 transition-transform shadow-md shadow-orange-500/20">
                      <Plus size={16} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Drinks */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4 uppercase tracking-wide flex items-center gap-2">
              <span>🥤</span> Drinks
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuData.drinks.map((drink, index) => (
                <button
                  key={drink.id}
                  onClick={() => handleAddItem(drink)}
                  style={{
                    animationDelay: `${
                      (index + menuData.sides.length) * 0.05
                    }s`,
                  }}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 animate-slide-up text-left"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    🥤
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                    {drink.name}
                  </h3>
                  {drink.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                      {drink.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-lg font-bold text-blue-500">
                      ${drink.price.toFixed(2)}
                    </span>
                    <div className="bg-blue-500 text-white rounded-lg p-1.5 group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                      <Plus size={16} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Cart Preview */}
          {items.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xl glass dark:bg-slate-800/90 rounded-2xl border border-gray-200/50 dark:border-slate-700 p-4 shadow-2xl shadow-gray-400/20 dark:shadow-slate-900/50 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#FF6B35] to-[#ff8555] rounded-xl shadow-lg shadow-orange-500/20">
                    <ShoppingCart className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Ready to checkout
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85d2a] hover:to-[#FF6B35] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
