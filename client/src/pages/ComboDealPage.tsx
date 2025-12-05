import { ArrowLeft, Gift, Plus, Settings, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useMenu } from "../contexts/MenuContext";
import { useCartStore } from "../stores/cartStore";

export default function ComboDealPage() {
  const navigate = useNavigate();
  const { menuData, loading } = useMenu();
  const { items: cartItems, addItem } = useCartStore();

  // Render loading screen while loading
  if (loading || !menuData) {
    return <LoadingScreen message="Loading combos..." />;
  }

  const combos = menuData?.combos || [];

  // Group combos by category
  const groupedCombos = combos.reduce((acc, combo) => {
    const category = combo.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(combo);
    return acc;
  }, {} as Record<string, typeof combos>);

  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      "pizza-special": "Pizza Specials",
      "walk-in": "Walk-In Specials",
      "family-special": "Family Specials",
      "daily-special": "Daily Specials",
      other: "Other Combos",
    };
    return titles[category] || category;
  };

  const handleAddToCart = (comboId: string) => {
    const combo = combos.find((c) => c.id === comboId);
    if (!combo) return;

    addItem({
      type: "combo_deal",
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

    navigate("/combo-customize", { state: { combo } });
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="glass dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/new-order")}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Combo Deals
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {combos.length} value combos
              </p>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="relative p-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <ShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8555] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          {Object.entries(groupedCombos).map(([category, categoryCombo]) => (
            <div key={category} className="animate-fade-in">
              {/* Category Header */}
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20">
                    <Gift className="text-white" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {getCategoryTitle(category)}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {categoryCombo.length} options available
                    </p>
                  </div>
                </div>
              </div>

              {/* Combos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryCombo.map((combo, index) => (
                  <div
                    key={combo.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 animate-slide-up"
                  >
                    {/* Combo Header */}
                    <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🍕</span>
                          </div>
                          <h3 className="text-lg font-bold truncate">
                            {combo.name}
                          </h3>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <span className="text-xl font-bold">
                            ${combo.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Included Items */}
                    <div className="p-4 flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                        Includes
                      </p>
                      <div className="space-y-2">
                        {combo.items.split(",").map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-600 dark:text-slate-300">
                              {item.trim()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          Total
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ${combo.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCustomize(combo.id)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Settings size={18} />
                          <span>Customize</span>
                        </button>
                        <button
                          onClick={() => handleAddToCart(combo.id)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85d2a] hover:to-[#FF6B35] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Plus size={18} />
                          <span>Quick Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cart Preview */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xl glass dark:bg-slate-800/90 rounded-2xl border border-gray-200/50 dark:border-slate-700 p-4 shadow-2xl shadow-gray-400/20 dark:shadow-slate-900/50 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#FF6B35] to-[#ff8555] rounded-xl shadow-lg shadow-orange-500/20">
                  <ShoppingCart className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"}
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
                View Cart
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
