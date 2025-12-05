import { ArrowLeft, Gift, Plus, Settings, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useMenu } from "../contexts/MenuContext";
import { useCartStore } from "../stores/cartStore";

const categoryTitles: Record<string, string> = {
  "pizza-special": "Pizza Specials",
  "walk-in": "Walk-In Specials",
  "family-special": "Family Specials",
  other: "Other Combos",
};

const categoryAccents: Record<string, { gradient: string; badge: string }> = {
  "pizza-special": {
    gradient: "from-[#FF6B35] via-[#FF8C55] to-[#FFA36F]",
    badge: "bg-[#FF6B35]",
  },
  "walk-in": {
    gradient: "from-[#2563EB] via-[#3B82F6] to-[#60A5FA]",
    badge: "bg-[#2563EB]",
  },
  "family-special": {
    gradient: "from-[#7C3AED] via-[#A855F7] to-[#D946EF]",
    badge: "bg-[#7C3AED]",
  },
  other: {
    gradient: "from-[#0EA5E9] via-[#22D3EE] to-[#38BDF8]",
    badge: "bg-[#0EA5E9]",
  },
};

function getCategoryTitle(categoryKey: string) {
  return categoryTitles[categoryKey] || categoryTitles.other;
}

export default function ComboDealPage() {
  const navigate = useNavigate();
  const { menuData, loading } = useMenu();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  if (loading || !menuData) {
    return <LoadingScreen message="Loading combo deals..." />;
  }

  const combos = menuData.combos ?? [];

  const groupedCombos = combos.reduce<Record<string, typeof combos>>(
    (acc, combo) => {
      const categoryKey = combo.category || "other";
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(combo);
      return acc;
    },
    {}
  );

  const handleAddToCart = (comboId: string) => {
    const combo = combos.find((c) => c.id === comboId);
    if (!combo) return;

    addItem({
      type: "combo_deal",
      name: combo.name,
      price: combo.price,
      quantity: 1,
      comboId: combo.id,
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
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col animate-fade-in">
      <header className="border-b border-slate-200/60 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="w-[140px] flex justify-start">
              <button
                onClick={() => navigate("/new-order")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-800/70 hover:bg-slate-50 hover:shadow-sm transition-all duration-200"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Combo Deals
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {combos.length} curated bundles
              </p>
            </div>

            <div className="w-[140px] flex justify-end">
              <button
                onClick={() => navigate("/checkout")}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ShoppingCart size={20} strokeWidth={1.6} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#FF6B35] px-1 text-xs font-semibold text-white shadow-sm">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-10 pt-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-10">
          {Object.entries(groupedCombos).map(([category, categoryCombos]) => {
            const accent = categoryAccents[category] || categoryAccents.other;

            return (
              <section key={category} className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.gradient} text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]`}
                  >
                    <Gift size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {getCategoryTitle(category)}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {categoryCombos.length} options available
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryCombos.map((combo, index) => (
                    <div
                      key={combo.id}
                      style={{ animationDelay: `${index * 0.06}s` }}
                      className="group flex h-full flex-col rounded-[26px] border border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-900/75 shadow-[0_16px_40px_rgba(15,23,42,0.1)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.15)] dark:hover:shadow-[0_24px_55px_rgba(0,0,0,0.55)] animate-slide-up"
                    >
                      <div
                        className={`rounded-t-[26px] bg-gradient-to-r ${accent.gradient} px-5 py-4 text-white`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                              <span className="text-2xl">🍕</span>
                            </div>
                            <h3 className="truncate text-lg font-semibold">
                              {combo.name}
                            </h3>
                          </div>
                          <div className="rounded-xl bg-white/15 px-3 py-1.5 text-sm font-semibold">
                            ${combo.price.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 px-5 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Includes
                        </p>
                        <div className="mt-3 space-y-2">
                          {combo.items.split(",").map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 text-left"
                            >
                              <span
                                className={`mt-2 h-1.5 w-1.5 rounded-full ${accent.badge}`}
                              ></span>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {item.trim()}
                              </p>
                            </div>
                          ))}
                        </div>
                        {combo.description && (
                          <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                            {combo.description}
                          </p>
                        )}
                      </div>

                      <div className="rounded-b-[26px] border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            onClick={() => handleCustomize(combo.id)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300/70 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-200 transition-all duration-200 hover:bg-white hover:shadow-sm"
                          >
                            <Settings size={18} />
                            Customize
                          </button>
                          <button
                            onClick={() => handleAddToCart(combo.id)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#f2602c] hover:shadow-[0_12px_24px_rgba(255,107,53,0.22)]"
                          >
                            <Plus size={18} />
                            Quick Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {cartItems.length > 0 && (
        <div className="fixed bottom-8 left-1/2 z-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[28px] border border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/80 px-6 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.5)] backdrop-blur-md animate-slide-up">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C55] text-white shadow-[0_12px_24px_rgba(255,107,53,0.28)]">
                <ShoppingCart size={22} strokeWidth={1.4} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to checkout
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="inline-flex items-center justify-center rounded-full bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#f2602c] hover:shadow-[0_12px_24px_rgba(255,107,53,0.22)]"
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
