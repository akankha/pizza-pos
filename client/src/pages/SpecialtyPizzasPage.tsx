import { ArrowLeft, Edit, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PizzaSizeName, SpecialtyPizza } from "../../../shared/types";
import LoadingScreen from "../components/LoadingScreen";
import { useMenu } from "../contexts/MenuContext";
import { useCartStore } from "../stores/cartStore";
import { usePizzaBuilderStore } from "../stores/pizzaBuilderStore";

export default function SpecialtyPizzasPage() {
  const navigate = useNavigate();
  const { menuData, loading } = useMenu();
  const { items: cartItems, addItem } = useCartStore();
  const resetPizzaBuilder = usePizzaBuilderStore((state) => state.reset);
  const setPizzaBuilder = usePizzaBuilderStore((state) => state);
  const [selectedSizes, setSelectedSizes] = useState<
    Record<string, PizzaSizeName>
  >({});

  const specialtyPizzas = menuData?.specialtyPizzas || [];

  const handleAddToCart = (pizzaId: string) => {
    const pizza = specialtyPizzas.find((p) => p.id === pizzaId);
    const size = selectedSizes[pizzaId] || "medium";

    if (!pizza) return;

    const price = pizza.prices[size];

    addItem({
      type: "specialty_pizza",
      name: pizza.name,
      size,
      price,
      quantity: 1,
      specialtyPizzaId: pizzaId,
      itemData: {
        name: pizza.name,
        description: pizza.description,
        toppings: pizza.toppings,
        size,
        price,
      },
    });

    // Reset selection
    setSelectedSizes((prev) => ({ ...prev, [pizzaId]: "medium" }));
  };

  const handleCustomize = (pizza: SpecialtyPizza) => {
    const size = selectedSizes[pizza.id] || "medium";

    // Extract topping names from the pizza's toppings string
    const toppingNames = pizza.toppings.split(",").map((t) => t.trim());

    // Find matching topping IDs from menuData
    const toppingIds =
      menuData?.toppings
        .filter((t) =>
          toppingNames.some(
            (name) =>
              t.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(t.name.toLowerCase())
          )
        )
        .map((t) => t.id) || [];

    // Set up pizza builder with specialty pizza as base
    resetPizzaBuilder();
    setPizzaBuilder.setSize(size);
    setPizzaBuilder.setCrust("regular");

    // Add toppings
    toppingIds.forEach((toppingId) => {
      setPizzaBuilder.toggleTopping(toppingId);
    });

    // Navigate to pizza builder with specialty pizza context
    navigate("/pizza-builder", {
      state: {
        specialtyBase: pizza.name,
        specialtyId: pizza.id,
        basePrice: pizza.prices[size],
      },
    });
  };

  const getSizeLabel = (size: PizzaSizeName): string => {
    const labels: Record<PizzaSizeName, string> = {
      small: "S",
      medium: "M",
      large: "L",
      xlarge: "XL",
    };
    return labels[size];
  };

  // Show loading screen while loading
  if (loading || !menuData) {
    return <LoadingScreen message="Loading specialty pizzas..." />;
  }

  return (
    <div className="h-screen w-screen bg-[#F6F8FC] dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/70 bg-[#F6F8FC]/90 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="w-[140px] flex justify-start">
              <button
                onClick={() => navigate("/new-order")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 bg-white/80 dark:bg-slate-800/70 hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Specialty Pizzas
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {specialtyPizzas.length} signature pizzas
              </p>
            </div>

            <div className="w-[140px] flex justify-end">
              <button
                onClick={() => navigate("/checkout")}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialtyPizzas.map((pizza, index) => {
              const selectedSize = selectedSizes[pizza.id] || "medium";
              const price = pizza.prices[selectedSize];

              return (
                <div
                  key={pizza.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="group bg-white/95 dark:bg-slate-900/85 rounded-2xl border-2 border-gray-200 dark:border-slate-700 shadow-[0_22px_55px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(15,23,42,0.35)] hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-slide-up"
                >
                  {/* Pizza Header */}
                  <div className="bg-gradient-to-r from-[#FF6B35] to-orange-500 p-4 text-white">
                    <h3 className="text-lg font-bold">{pizza.name}</h3>
                  </div>

                  {/* Toppings */}
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Toppings
                    </p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                      {pizza.toppings}
                    </p>
                  </div>

                  {/* Size Selection */}
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2.5 uppercase tracking-wide">
                      Select Size
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          "small",
                          "medium",
                          "large",
                          "xlarge",
                        ] as PizzaSizeName[]
                      ).map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setSelectedSizes((prev) => ({
                              ...prev,
                              [pizza.id]: size,
                            }))
                          }
                          className={`py-2.5 px-2 rounded-xl border-2 font-medium transition-all duration-200 ${
                            selectedSize === size
                              ? "border-[#FF6B35] bg-[#FF6B35] text-white shadow-lg shadow-orange-500/20"
                              : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500"
                          }`}
                        >
                          <div className="text-xs">{getSizeLabel(size)}</div>
                          <div className="text-xs mt-0.5">
                            ${pizza.prices[size].toFixed(2)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="p-4 bg-gray-50/80 dark:bg-slate-800/55 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${price.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCustomize(pizza)}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                      >
                        <Edit size={18} />
                        <span>Customize</span>
                      </button>
                      <button
                        onClick={() => handleAddToCart(pizza.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#e85d2a] hover:to-[#FF6B35] text-white rounded-xl font-semibold transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg active:scale-[0.98]"
                      >
                        <Plus size={18} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Preview */}
          {cartItems.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xl bg-white/95 dark:bg-slate-900/90 rounded-2xl border-2 border-gray-200 dark:border-slate-700 p-4 shadow-[0_24px_55px_rgba(15,23,42,0.25)] dark:shadow-[0_24px_55px_rgba(15,23,42,0.45)] backdrop-blur-lg animate-slide-up">
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
