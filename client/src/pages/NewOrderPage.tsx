import {
  ArrowLeft,
  Coffee,
  Flame,
  Gift,
  Pizza,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
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
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <TouchButton
              onClick={() => navigate("/")}
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
              onClick={() => navigate("/checkout")}
              variant="ghost"
              size="medium"
              className="relative !text-gray-700"
              aria-label={`Shopping cart with ${cartItems.length} ${
                cartItems.length === 1 ? "item" : "items"
              }`}
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <>
                  <span
                    className="absolute -top-1 -right-1 bg-[#FF6B35] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    aria-hidden="true"
                  >
                    {cartItems.length}
                  </span>
                  <span
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"} in cart
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={category.action}
                aria-label={`${category.title}: ${category.description}`}
                className="group bg-white rounded-2xl border-2 border-gray-300 p-10 md:p-12 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.98] shadow-md"
              >
                <div className="flex flex-col items-center text-center gap-6">
                  {/* Icon */}
                  <div
                    className={`${category.iconBg} p-7 rounded-xl group-hover:scale-110 transition-transform duration-200`}
                  >
                    <category.icon
                      size={60}
                      className={category.iconColor}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#FF6B35] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-700 font-medium">
                      {category.description}
                    </p>
                  </div>

                  {/* Visual Indicator */}
                  <div className="mt-3 w-full">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${category.gradient} group-hover:h-2.5 transition-all duration-200`}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Cart Preview (if items exist) */}
          {cartItems.length > 0 && (
            <div className="mt-8 bg-white rounded-xl border-2 border-orange-400 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg border border-orange-300">
                    <ShoppingCart
                      className="text-[#FF6B35]"
                      size={24}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"} in cart
                    </p>
                    <p className="text-sm text-gray-600">Ready to checkout</p>
                  </div>
                </div>
                <TouchButton
                  onClick={() => navigate("/checkout")}
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
