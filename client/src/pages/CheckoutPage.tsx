import { ArrowLeft, Banknote, CreditCard, Home, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaymentMethod } from "../../../shared/types";
import OnScreenKeyboard from "../components/OnScreenKeyboard";
import OrderItemCard from "../components/OrderItemCard";
import { showToast } from "../components/Toast";
import TouchButton from "../components/TouchButton";
import { useCartStore } from "../stores/cartStore";
import { apiUrl, authFetch } from "../utils/api";
import { getCurrentUser } from "../utils/auth";
import { browserPrintService } from "../utils/browserPrintService";
import { shouldShowOnScreenKeyboard } from "../utils/deviceDetection";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [taxRates, setTaxRates] = useState({
    gst: 0.05,
    pst: 0.07,
    gstLabel: "GST",
    pstLabel: "PST",
  });

  useEffect(() => {
    // Fetch tax rates from settings
    authFetch("api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTaxRates({
            gst: parseFloat(data.data.gst_rate) || 0.05,
            pst: parseFloat(data.data.pst_rate) || 0.07,
            gstLabel: data.data.tax_label_gst || "GST",
            pstLabel: data.data.tax_label_pst || "PST",
          });
        }
      })
      .catch((err) => console.error("Failed to fetch tax settings:", err));
  }, []);

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      // Get current user info
      const currentUser = getCurrentUser();

      // Create order with payment method and user info
      const orderResponse = await authFetch("api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          notes: orderNotes.trim() || undefined,
          createdBy: currentUser?.id,
          createdByName: currentUser?.full_name || currentUser?.username,
          // Discount fields
          discountPercent: Number(discountPercent) || 0,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // Store order ID for receipt
      setCompletedOrderId(orderResult.data.id);

      // Get restaurant settings
      let restaurantInfo = {
        name: "Pizza Shop",
        address: "",
        phone: "",
      };

      try {
        const settingsRes = await authFetch("api/settings");
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          restaurantInfo = {
            name: settingsData.data.restaurant_name || "Pizza Shop",
            address: settingsData.data.restaurant_address || "",
            phone: settingsData.data.restaurant_phone || "",
          };
        }
      } catch (err) {
        console.error("Failed to fetch restaurant settings:", err);
      }

      // Auto-print receipt via QZ Tray (works in browsers!)
      try {
        const printData = {
          orderId: orderResult.data.id,
          orderNumber: parseInt(new Date().getTime().toString().slice(-6)),
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            customPizza: item.customPizza,
          })),
          subtotal: total,
          discountPercent: appliedCoupon ? appliedCoupon.discountValue : (Number(discountPercent) || 0),
          discountAmount: Number((total - discountedSubtotal).toFixed(2)) || 0,
          gst: gstAmount,
          pst: pstAmount,
          tax: gstAmount + pstAmount,
          total: grandTotal,
          paymentMethod,
          createdByName: currentUser?.full_name || currentUser?.username,
          notes: orderNotes.trim() || undefined,
          restaurantInfo,
        };

        console.log("🖨️  Auto-printing receipt...");
        const printResult = await browserPrintService.print(printData);

        if (printResult.success) {
          console.log("✅ Print dialog opened");
        } else {
          console.warn("⚠️  Print failed:", printResult.error);
        }
      } catch (printError) {
        console.error("Print error:", printError);
        // Don't block order completion if printing fails
      }

      // Show success (kitchen will auto-refresh via polling)
      setShowSuccess(true);
      clearCart();

      // Return to home after delay
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      console.error("Payment error:", error);
      showToast("Payment failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (completedOrderId) {
      window.open(
        apiUrl(`/api/orders/${completedOrderId}/receipt/pdf`),
        "_blank"
      );
    }
  };

  if (showSuccess) {
    return (
      <div className="h-screen w-screen bg-[#10B981] dark:bg-green-800 flex flex-col items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="bg-white/20 backdrop-blur-lg rounded-full w-48 h-48 flex items-center justify-center mx-auto mb-8 animate-pulse">
            <div className="text-9xl" aria-hidden="true">
              ✓
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4">Order Complete!</h1>
          <p className="text-3xl">Thank you for your order</p>

          {/* Receipt Download Button */}
          {completedOrderId && (
            <TouchButton
              onClick={handleDownloadReceipt}
              variant="outline"
              size="large"
              aria-label="Download receipt PDF"
              className="!bg-white/20 !text-white hover:!bg-white/30 backdrop-blur-sm !border-white/40 mt-8"
            >
              <Receipt size={32} aria-hidden="true" />
              <span className="ml-3">Download Receipt</span>
            </TouchButton>
          )}

          <p className="text-2xl mt-8 opacity-80" aria-live="polite">
            Returning to home screen...
          </p>
        </div>
      </div>
    );
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      const response = await authFetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderAmount: getTotal() })
      });

      const result = await response.json();

      if (result.success) {
        setAppliedCoupon(result.coupon);
        setCouponError("");
        showToast("Coupon applied successfully!", "success");
      } else {
        setAppliedCoupon(null);
        setCouponError(result.error);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
      console.error("Coupon validation error:", error);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const total = getTotal();

  // Calculate discounts: coupon first, then manual discount
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterCouponSubtotal = Math.max(0, total - couponDiscount);
  const discountedSubtotal = Math.max(0, afterCouponSubtotal * (1 - Math.min(Math.max(discountPercent, 0), 100) / 100));

  const gstAmount = discountedSubtotal * taxRates.gst;
  const pstAmount = discountedSubtotal * taxRates.pst;
  const grandTotal = discountedSubtotal * (1 + taxRates.gst + taxRates.pst);

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
              Checkout
            </h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
          >
            <Home size={20} />
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-slide-up">
          <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
            <div className="text-5xl opacity-40">🛒</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-400 dark:text-slate-500 mb-6 text-center">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/new-order")}
            className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#e85d2a] hover:to-[#FF6B35] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
          >
            Start New Order
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Items list */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
              Order Items ({items.length})
            </h2>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <OrderItemCard
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              </div>
            ))}
          </div>

          {/* Right: Payment section */}
          <div className="w-full lg:w-96 glass dark:bg-slate-900/80 p-4 md:p-6 shadow-xl border-t lg:border-t-0 lg:border-l border-gray-200/50 dark:border-slate-800 flex flex-col max-h-screen lg:max-h-full overflow-y-auto custom-scrollbar">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Payment
            </h2>

            {/* Order Notes */}
            <div className="mb-4">
              <label
                htmlFor="orderNotes"
                className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide"
              >
                Order Notes (Optional)
              </label>
              {shouldShowOnScreenKeyboard() ? (
                <div
                  onClick={() => setShowKeyboard(true)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus-within:border-[#FF6B35] dark:focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 text-sm transition-all cursor-text min-h-[60px]"
                >
                  {orderNotes || (
                    <span className="text-gray-400 dark:text-slate-500">
                      Any special instructions...
                    </span>
                  )}
                </div>
              ) : (
                <textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  maxLength={500}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 text-sm resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              )}
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">
                {orderNotes.length}/500
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Coupon Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 text-sm"
                  disabled={!!appliedCoupon}
                />
                {!appliedCoupon ? (
                  <button
                    onClick={validateCoupon}
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e85d2a] text-white rounded-xl font-medium transition-all duration-200 text-sm"
                  >
                    Apply
                  </button>
                ) : (
                  <button
                    onClick={removeCoupon}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ {appliedCoupon.description || `${appliedCoupon.discountValue}${appliedCoupon.discountType === 'percentage' ? '%' : '$'} off`}
                </div>
              )}
              {couponError && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  ✗ {couponError}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Discount (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="w-28 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 text-sm"
                />
                <div className="text-sm text-gray-500">% off applied to subtotal</div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-slate-400">Subtotal</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">${total.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    Coupon ({appliedCoupon.code})
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    -${couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    Discount ({discountPercent}%)
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    -${(afterCouponSubtotal - discountedSubtotal).toFixed(2)}
                  </span>
                </div>
              )}
              {(appliedCoupon || discountPercent > 0) && (
                <div className="flex justify-between items-center mb-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Subtotal after discount</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">${discountedSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {taxRates.gstLabel} ({(taxRates.gst * 100).toFixed(1)}%)
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">${gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {taxRates.pstLabel} ({(taxRates.pst * 100).toFixed(1)}%)
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">${pstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-700 dark:text-slate-200">Total</span>
                  <span className="text-2xl font-bold text-[#FF6B35]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="space-y-3 mt-auto">
              <button
                onClick={() => handlePayment("card")}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#e85d2a] hover:to-[#FF6B35] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={22} />
                <span>{isProcessing ? "Processing..." : "Pay with Card"}</span>
              </button>

              <button
                onClick={() => handlePayment("cash")}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Banknote size={22} />
                <span>{isProcessing ? "Processing..." : "Pay with Cash"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-Screen Keyboard */}
      {showKeyboard && shouldShowOnScreenKeyboard() && (
        <OnScreenKeyboard
          currentValue={orderNotes}
          onInput={(value) => {
            if (value.length <= 500) {
              setOrderNotes(value);
            }
          }}
          onClose={() => setShowKeyboard(false)}
          isNumeric={false}
        />
      )}
    </div>
  );
}
