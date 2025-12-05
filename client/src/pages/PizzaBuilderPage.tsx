import { ArrowLeft, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useMenu } from "../contexts/MenuContext";
import { useCartStore } from "../stores/cartStore";
import { usePizzaBuilderStore } from "../stores/pizzaBuilderStore";

export default function PizzaBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuData, loading } = useMenu();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  // Get specialty pizza context from navigation state
  const specialtyContext = location.state as {
    specialtyBase?: string;
    specialtyId?: string;
    basePrice?: number;
  } | null;

  const [originalToppings, setOriginalToppings] = useState<string[]>([]);

  const {
    selectedSize,
    selectedCrust,
    selectedToppings,
    setSize,
    setCrust,
    toggleTopping,
    reset,
  } = usePizzaBuilderStore();

  // Track original toppings when coming from specialty pizza
  useEffect(() => {
    if (
      specialtyContext?.specialtyId &&
      selectedToppings.length > 0 &&
      originalToppings.length === 0
    ) {
      setOriginalToppings([...selectedToppings]);
    }
  }, [specialtyContext, selectedToppings, originalToppings]);

  // Show loading screen while loading
  if (loading || !menuData) {
    return <LoadingScreen message="Loading pizza builder..." />;
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedCrust) return;

    const sizeData = menuData.sizes.find((s) => s.name === selectedSize)!;
    const crustData = menuData.crusts.find((c) => c.type === selectedCrust)!;

    let totalPrice: number;
    let itemName: string;

    if (specialtyContext?.basePrice !== undefined) {
      // This is a customized specialty pizza
      // Smart pricing: Only charge if total topping count increases OR if swapping to more expensive topping

      const removedToppings = originalToppings.filter(
        (id) => !selectedToppings.includes(id)
      );
      const addedToppings = selectedToppings.filter(
        (id) => !originalToppings.includes(id)
      );

      // Calculate the price of removed and added toppings
      const removedToppingsPrices = removedToppings.map((id) => {
        const topping = menuData.toppings.find((t) => t.id === id);
        return { id, price: topping?.price || 0 };
      });

      const addedToppingsPrices = addedToppings.map((id) => {
        const topping = menuData.toppings.find((t) => t.id === id);
        return { id, price: topping?.price || 0 };
      });

      // Match removed toppings with added toppings by price (swapping same-price toppings = no charge)
      let extraCost = 0;
      const unmatchedAdded = [...addedToppingsPrices];
      const unmatchedRemoved = [...removedToppingsPrices];

      // For each removed topping, try to match with an added topping of same or lower price
      removedToppingsPrices.forEach((removed) => {
        const matchIndex = unmatchedAdded.findIndex(
          (added) => added.price <= removed.price
        );
        if (matchIndex !== -1) {
          // Found a swap - remove from unmatched list
          unmatchedAdded.splice(matchIndex, 1);
          const removeIndex = unmatchedRemoved.findIndex(
            (r) => r.id === removed.id
          );
          if (removeIndex !== -1) {
            unmatchedRemoved.splice(removeIndex, 1);
          }
        }
      });

      // Any remaining unmatched added toppings should be charged
      extraCost = unmatchedAdded.reduce((sum, t) => sum + t.price, 0);

      totalPrice = specialtyContext.basePrice + extraCost;
      itemName = `${specialtyContext.specialtyBase} (${sizeData.displayName})${
        extraCost > 0 ? " +Extras" : ""
      }`;
    } else {
      // Regular custom pizza
      const toppingPrices = selectedToppings.reduce((sum, toppingId) => {
        const topping = menuData.toppings.find((t) => t.id === toppingId);
        return sum + (topping?.price || 0);
      }, 0);

      totalPrice = sizeData.basePrice + crustData.priceModifier + toppingPrices;
      itemName = `Custom ${sizeData.displayName} Pizza`;
    }

    addItem({
      type: "custom_pizza",
      name: itemName,
      price: totalPrice,
      quantity: 1,
      customPizza: {
        size: selectedSize,
        crust: selectedCrust,
        toppings: selectedToppings,
      },
    });

    reset();
    navigate("/new-order");
  };

  const calculateTotal = () => {
    if (!selectedSize || !selectedCrust) return 0;

    if (specialtyContext?.basePrice !== undefined) {
      // Customized specialty pizza - smart pricing for swaps
      const removedToppings = originalToppings.filter(
        (id) => !selectedToppings.includes(id)
      );
      const addedToppings = selectedToppings.filter(
        (id) => !originalToppings.includes(id)
      );

      const removedToppingsPrices = removedToppings.map((id) => {
        const topping = menuData.toppings.find((t) => t.id === id);
        return { id, price: topping?.price || 0 };
      });

      const addedToppingsPrices = addedToppings.map((id) => {
        const topping = menuData.toppings.find((t) => t.id === id);
        return { id, price: topping?.price || 0 };
      });

      let extraCost = 0;
      const unmatchedAdded = [...addedToppingsPrices];
      const unmatchedRemoved = [...removedToppingsPrices];

      removedToppingsPrices.forEach((removed) => {
        const matchIndex = unmatchedAdded.findIndex(
          (added) => added.price <= removed.price
        );
        if (matchIndex !== -1) {
          unmatchedAdded.splice(matchIndex, 1);
          const removeIndex = unmatchedRemoved.findIndex(
            (r) => r.id === removed.id
          );
          if (removeIndex !== -1) {
            unmatchedRemoved.splice(removeIndex, 1);
          }
        }
      });

      extraCost = unmatchedAdded.reduce((sum, t) => sum + t.price, 0);

      return specialtyContext.basePrice + extraCost;
    }

    // Regular custom pizza
    const sizeData = menuData.sizes.find((s) => s.name === selectedSize)!;
    const crustData = menuData.crusts.find((c) => c.type === selectedCrust)!;

    const toppingPrices = selectedToppings.reduce((sum, toppingId) => {
      const topping = menuData.toppings.find((t) => t.id === toppingId);
      return sum + (topping?.price || 0);
    }, 0);

    return sizeData.basePrice + crustData.priceModifier + toppingPrices;
  };

  const canAddToCart = selectedSize && selectedCrust;

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/70 bg-slate-100/90 dark:bg-slate-950/80 backdrop-blur-sm">
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
                {specialtyContext?.specialtyBase
                  ? `Customize ${specialtyContext.specialtyBase}`
                  : "Build Your Pizza"}
              </h1>
            </div>

            <div className="w-[140px] flex justify-end">
              <button
                onClick={() => navigate("/checkout")}
                aria-label={`Shopping cart with ${cartItems.length} items`}
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
        {specialtyContext?.specialtyBase && (
          <div className="mx-4 mt-2 rounded-2xl border border-orange-200/60 dark:border-orange-800/50 bg-white/90 dark:bg-slate-900/70 px-4 py-3 text-sm text-orange-700 dark:text-orange-200 shadow-[0_12px_28px_rgba(255,107,53,0.12)]">
            <div className="flex items-center gap-2">
              <span className="font-semibold">💰</span>
              <span>
                Base ${specialtyContext.basePrice?.toFixed(2)} - Only extra
                toppings add to cost
              </span>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Pizza Customization */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {/* Size Selection */}
          <div className="animate-slide-up" style={{ animationDelay: "0s" }}>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <span>📏</span> Select Size
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {menuData.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSize(size.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)] ${
                    selectedSize === size.name
                      ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-orange-500/30"
                      : "bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white hover:border-[#FF6B35] dark:hover:border-[#FF6B35] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="text-center">
                    <span className="font-bold text-base block">
                      {size.displayName}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        selectedSize === size.name
                          ? "text-white/90"
                          : "text-[#FF6B35]"
                      }`}
                    >
                      ${size.basePrice.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Crust Selection */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <span>🥖</span> Select Crust
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {menuData.crusts.map((crust) => (
                <button
                  key={crust.id}
                  onClick={() => setCrust(crust.type)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)] ${
                    selectedCrust === crust.type
                      ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-orange-500/30"
                      : "bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white hover:border-[#FF6B35] dark:hover:border-[#FF6B35] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="text-center">
                    <span className="font-bold text-base block">
                      {crust.displayName}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        selectedCrust === crust.type
                          ? "text-white/90"
                          : "text-[#FF6B35]"
                      }`}
                    >
                      {crust.priceModifier > 0
                        ? `+$${crust.priceModifier.toFixed(2)}`
                        : "Free"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Toppings Selection */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <span>🧀</span> Add Toppings
              <span className="text-xs font-normal bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {selectedToppings.length} selected
              </span>
            </h2>

            {["meat", "cheese", "veggie"].map((category) => (
              <div key={category} className="mb-5">
                <h3 className="text-xs font-medium text-gray-400 dark:text-slate-500 mb-2 capitalize flex items-center gap-2">
                  {category === "meat" && "🥩"}
                  {category === "cheese" && "🧀"}
                  {category === "veggie" && "🥬"}
                  {category} Toppings
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {menuData.toppings
                    .filter((t) => t.category === category)
                    .map((topping) => {
                      const isSelected = selectedToppings.includes(topping.id);
                      return (
                        <button
                          key={topping.id}
                          onClick={() => toggleTopping(topping.id)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.4)] ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30"
                              : "bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white hover:border-emerald-500 dark:hover:border-emerald-500 hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">
                              {topping.name}
                            </div>
                            <div
                              className={`text-xs font-semibold ${
                                isSelected
                                  ? "text-white/90"
                                  : "text-emerald-500"
                              }`}
                            >
                              +${topping.price.toFixed(2)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="w-full lg:w-96 bg-white dark:bg-slate-900/85 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 px-4 py-6 flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4 uppercase tracking-wide">
            Your Pizza
          </h3>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-5 custom-scrollbar">
            {/* Size */}
            <div className="bg-white/95 dark:bg-slate-900/80 rounded-xl p-3 border border-gray-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                Size
              </div>
              <div className="font-semibold text-gray-800 dark:text-white">
                {selectedSize
                  ? menuData.sizes.find((s) => s.name === selectedSize)
                      ?.displayName
                  : "Not selected"}
              </div>
            </div>

            {/* Crust */}
            <div className="bg-white/95 dark:bg-slate-900/80 rounded-xl p-3 border border-gray-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                Crust
              </div>
              <div className="font-semibold text-gray-800 dark:text-white">
                {selectedCrust
                  ? menuData.crusts.find((c) => c.type === selectedCrust)
                      ?.displayName
                  : "Not selected"}
              </div>
            </div>

            {/* Toppings - scrollable */}
            <div className="bg-white/95 dark:bg-slate-900/80 rounded-xl p-3 border border-gray-200 dark:border-slate-700 max-h-40 overflow-y-auto">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                Toppings ({selectedToppings.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedToppings.length === 0 ? (
                  <span className="text-gray-400 dark:text-slate-500 italic text-sm">
                    No toppings
                  </span>
                ) : (
                  selectedToppings.map((toppingId) => {
                    const topping = menuData.toppings.find(
                      (t) => t.id === toppingId
                    );
                    return (
                      <span
                        key={toppingId}
                        className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-medium"
                      >
                        {topping?.name}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Total - Always visible at bottom */}
          <div className="bg-gradient-to-r from-[#FF6B35] to-orange-500 rounded-2xl p-4 text-white mb-4 shadow-[0_18px_40px_rgba(255,107,53,0.18)]">
            <div className="text-sm font-medium mb-1 text-white/80">
              Total Price
            </div>
            <div className="text-3xl font-bold">
              ${calculateTotal().toFixed(2)}
            </div>
          </div>

          {/* Add to Cart Button - Always visible at bottom */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              canAddToCart
                ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-gray-200/80 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            <Plus size={22} />
            <span>Add to Order</span>
          </button>
          {!canAddToCart && (
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">
              Please select size and crust
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
