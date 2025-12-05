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
      gradient: "from-[#FF6B35] to-orange-500",
      iconBg: "bg-orange-100",
      iconColor: "text-[#FF6B35]",
    },
    {
      title: "Specialty Pizzas",
      description: "Our signature gourmet pizzas",
      icon: Flame,
      action: () => navigate("/specialty-pizzas"),
      gradient: "from-red-500 to-orange-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
    {
      title: "Combo Deals",
      description: "Great value family & special combos",
      icon: Gift,
      action: () => navigate("/combos"),
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
    },
    {
      title: "Sides & Drinks",
      description: "Wings, salads, beverages & more",
      icon: Coffee,
      action: () => navigate("/sides-drinks"),
      gradient: "from-[#004E89] to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-[#004E89]",
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="glass dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                New Order
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Select a category
              </p>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="relative p-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              aria-label={`Shopping cart with ${cartItems.length} items`}
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {categories.map((category, index) => (
              <button
                key={category.title}
                onClick={category.action}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300 animate-slide-up"
              >
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>

                <div className="relative flex flex-col items-center text-center gap-5">
                  {/* Icon */}
                  <div
                    className={`${category.iconBg} dark:bg-slate-700 p-6 rounded-2xl group-hover:scale-105 group-hover:shadow-lg transition-all duration-300`}
                  >
                    <category.icon
                      size={40}
                      className={`${category.iconColor} dark:text-slate-300`}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF6B35] transition-colors duration-200">
                      {category.title}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400">
                      {category.description}
                    </p>
                  </div>

                  {/* Bottom indicator */}
                  <div
                    className={`w-16 h-1.5 rounded-full bg-gradient-to-r ${category.gradient} transition-all duration-300 group-hover:w-24`}
                  ></div>
                </div>
              </button>
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
        </div>
      </main>
    </div>
  );
}
