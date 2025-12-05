import {
  ArrowLeft,
  Coffee,
  Flame,
  Gift,
  Pizza,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { usePizzaBuilderStore } from "../stores/pizzaBuilderStore";

export default function NewOrderPage() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const resetPizzaBuilder = usePizzaBuilderStore((state) => state.reset);

  const handleBuildPizza = () => {
    resetPizzaBuilder();
    navigate("/pizza-builder");
  };

  const categories = [
    {
      title: "Build a Pizza",
      description: "Create your perfect custom pizza",
      icon: Pizza,
      action: handleBuildPizza,
      iconAccent: "from-[#FFE7D7] to-[#FFDCC5]",
      iconColor: "text-[#FF6B35]",
      indicator: "from-[#FF6B35] to-[#FF935F]",
    },
    {
      title: "Specialty Pizzas",
      description: "Our signature gourmet pizzas",
      icon: Flame,
      action: () => navigate("/specialty-pizzas"),
      iconAccent: "from-[#FFE4DD] to-[#FFE1D4]",
      iconColor: "text-[#F97316]",
      indicator: "from-[#F97316] to-[#FDA260]",
    },
    {
      title: "Combo Deals",
      description: "Great value family & special combos",
      icon: Gift,
      action: () => navigate("/combos"),
      iconAccent: "from-[#EFE6FF] to-[#E5E0FF]",
      iconColor: "text-[#8B5CF6]",
      indicator: "from-[#8B5CF6] to-[#C084FC]",
    },
    {
      title: "Sides & Drinks",
      description: "Wings, salads, beverages & more",
      icon: Coffee,
      action: () => navigate("/sides-drinks"),
      iconAccent: "from-[#E1ECFF] to-[#D5E5FF]",
      iconColor: "text-[#2563EB]",
      indicator: "from-[#2563EB] to-[#60A5FA]",
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col animate-fade-in">
      <header className="border-b border-slate-200/60 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="w-[140px] flex justify-start">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-800/70 hover:bg-slate-50 hover:shadow-sm transition-all duration-200"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                New Order
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select a category to get started
              </p>
            </div>

            <div className="w-[140px] flex justify-end">
              <button
                onClick={() => navigate("/checkout")}
                aria-label={`Shopping cart with ${cartItems.length} items`}
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

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {categories.map((category, index) => (
              <button
                key={category.title}
                onClick={category.action}
                style={{ animationDelay: `${index * 0.08}s` }}
                className="group flex h-full flex-col items-center justify-start gap-6 rounded-[28px] border-2 border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800/90 px-10 py-12 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6B35]/50 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] dark:hover:border-[#FF6B35]/50 animate-slide-up"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.iconAccent} text-base font-semibold ${category.iconColor}`}
                >
                  <category.icon size={28} strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-white">
                    {category.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>

                <div
                  className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${category.indicator} transition-all duration-300 group-hover:w-24`}
                ></div>
              </button>
            ))}
          </div>
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
              className="inline-flex items-center justify-center rounded-full bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#f2602c] hover:shadow-[0_12px_24px_rgba(255,107,53,0.25)]"
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
