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
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="glass dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/new-order")}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Specialty Pizzas
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {specialtyPizzas.length} signature pizzas
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialtyPizzas.map((pizza, index) => {
              const selectedSize = selectedSizes[pizza.id] || "medium";
              const price = pizza.prices[selectedSize];

              return (
                <div
                  key={pizza.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-slide-up"
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
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50">
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
