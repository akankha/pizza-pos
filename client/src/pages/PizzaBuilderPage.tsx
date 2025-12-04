import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
import { useMenu } from "../contexts/MenuContext";
import { useCartStore } from "../stores/cartStore";
import { usePizzaBuilderStore } from "../stores/pizzaBuilderStore";

export default function PizzaBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuData, loading } = useMenu();
  const addItem = useCartStore((state) => state.addItem);

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

  if (loading || !menuData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-3xl font-bold text-[#FF6B35]">Loading menu...</div>
      </div>
    );
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
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={() => navigate("/new-order")}
            variant="ghost"
            size="medium"
            className="!p-2 sm:!p-3"
          >
            <ArrowLeft size={20} className="sm:w-7 sm:h-7" />
          </TouchButton>

          <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-gray-800 text-center">
            🍕{" "}
            {specialtyContext?.specialtyBase
              ? `Customize ${specialtyContext.specialtyBase}`
              : "Build Your Pizza"}
          </h1>

          <div className="w-8 sm:w-24"></div>
        </div>
        {specialtyContext?.specialtyBase && (
          <div className="bg-orange-50 border-t border-orange-200 px-3 sm:px-6 py-2 sm:py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-orange-800 text-sm sm:text-base">
              <span className="font-semibold">💰 Special Price:</span>
              <span>
                Base ${specialtyContext.basePrice?.toFixed(2)} - Only extra
                toppings add to cost
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Pizza Customization */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Size Selection */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📏</span> Select Size
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {menuData.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSize(size.name)}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                    selectedSize === size.name
                      ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-xl"
                      : "bg-white/80 backdrop-blur-sm border-gray-200 text-gray-800 hover:border-[#FF6B35] shadow-lg hover:shadow-xl"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">
                      {size.displayName}
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        selectedSize === size.name
                          ? "text-white"
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
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🥖</span> Select Crust
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {menuData.crusts.map((crust) => (
                <button
                  key={crust.id}
                  onClick={() => setCrust(crust.type)}
                  className={`p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                    selectedCrust === crust.type
                      ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-xl"
                      : "bg-white/80 backdrop-blur-sm border-gray-200 text-gray-800 hover:border-[#FF6B35] shadow-lg hover:shadow-xl"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">
                      {crust.displayName}
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        selectedCrust === crust.type
                          ? "text-white"
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
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧀</span> Add Toppings
              <span className="text-xl font-normal text-gray-500">
                ({selectedToppings.length} selected)
              </span>
            </h2>

            {["meat", "cheese", "veggie"].map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-bold text-gray-600 mb-3 capitalize flex items-center gap-2">
                  {category === "meat" && "🥩"}
                  {category === "cheese" && "🧀"}
                  {category === "veggie" && "🥬"}
                  {category} Toppings
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {menuData.toppings
                    .filter((t) => t.category === category)
                    .map((topping) => {
                      const isSelected = selectedToppings.includes(topping.id);
                      return (
                        <button
                          key={topping.id}
                          onClick={() => toggleTopping(topping.id)}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                            isSelected
                              ? "bg-[#10B981] border-[#10B981] text-white shadow-lg"
                              : "bg-white/80 backdrop-blur-sm border-gray-200 text-gray-800 hover:border-[#10B981] shadow-md hover:shadow-lg"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold mb-1">
                              {topping.name}
                            </div>
                            <div
                              className={`text-sm ${
                                isSelected ? "text-white" : "text-[#10B981]"
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
        <div className="w-full lg:w-96 bg-white/80 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-200 p-3 sm:p-4 md:p-8 flex flex-col shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
            Your Pizza
          </h3>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4">
            {/* Size */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
                Size
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-800">
                {selectedSize
                  ? menuData.sizes.find((s) => s.name === selectedSize)
                      ?.displayName
                  : "Not selected"}
              </div>
            </div>

            {/* Crust */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
                Crust
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-800">
                {selectedCrust
                  ? menuData.crusts.find((c) => c.type === selectedCrust)
                      ?.displayName
                  : "Not selected"}
              </div>
            </div>

            {/* Toppings - scrollable */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-h-64 overflow-y-auto">
              <div className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">
                Toppings ({selectedToppings.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedToppings.length === 0 ? (
                  <span className="text-gray-400 italic text-sm">
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
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow"
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
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-4">
            <div className="text-lg font-semibold mb-2">Total Price</div>
            <div className="text-5xl font-bold">
              ${calculateTotal().toFixed(2)}
            </div>
          </div>

          {/* Add to Cart Button - Always visible at bottom */}
          <div>
            <TouchButton
              onClick={handleAddToCart}
              variant={canAddToCart ? "success" : "outline"}
              size="large"
              disabled={!canAddToCart}
              className="w-full text-lg md:text-2xl !py-4 md:!py-6"
            >
              <div className="flex items-center justify-center gap-3">
                <Plus size={32} />
                <span>Add to Order</span>
              </div>
            </TouchButton>
            {!canAddToCart && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please select size and crust
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
