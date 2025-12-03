import { ArrowLeft, Banknote, CreditCard, Home, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaymentMethod } from "../../../shared/types";
import OrderItemCard from "../components/OrderItemCard";
import TouchButton from "../components/TouchButton";
import { useCartStore } from "../stores/cartStore";
import { apiUrl } from "../utils/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [taxRates, setTaxRates] = useState({
    gst: 0.05,
    pst: 0.07,
    gstLabel: "GST",
    pstLabel: "PST",
  });

  useEffect(() => {
    // Fetch tax rates from settings
    fetch(apiUrl("api/settings"))
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
      // Create order with payment method
      const orderResponse = await fetch(apiUrl("api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          notes: orderNotes.trim() || undefined,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // Store order ID for receipt
      setCompletedOrderId(orderResult.data.id);

      // Show success (kitchen will auto-refresh via polling)
      setShowSuccess(true);
      clearCart();

      // Return to home after delay
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (completedOrderId) {
      window.open(`/api/orders/${completedOrderId}/receipt/pdf`, "_blank");
    }
  };

  if (showSuccess) {
    return (
      <div className="h-screen w-screen bg-[#10B981] flex flex-col items-center justify-center p-8">
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

  const total = getTotal();

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={() => navigate("/new-order")}
            variant="ghost"
            size="medium"
          >
            <ArrowLeft size={28} />
          </TouchButton>

          <h1 className="text-4xl font-bold text-gray-800">🛒 Checkout</h1>

          <TouchButton
            onClick={() => navigate("/")}
            variant="ghost"
            size="medium"
          >
            <Home size={28} />
          </TouchButton>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-9xl mb-6 opacity-30">🛒</div>
          <h2 className="text-4xl font-bold text-gray-400 mb-8">
            Your cart is empty
          </h2>
          <TouchButton
            onClick={() => navigate("/new-order")}
            variant="primary"
            size="large"
            className="text-2xl"
          >
            Start New Order
          </TouchButton>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Items list */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Order Items ({items.length})
            </h2>
            {items.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Right: Payment section */}
          <div className="w-full lg:w-96 bg-white p-4 md:p-6 lg:p-8 shadow-lg border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col max-h-screen lg:max-h-full overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Payment</h2>

            {/* Order Notes */}
            <div className="mb-6">
              <label
                htmlFor="orderNotes"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Order Notes (Optional)
              </label>
              <textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special instructions..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-base resize-none transition-colors"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {orderNotes.length}/500
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-4 md:mb-8 border-2 border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-semibold text-gray-600">
                  Subtotal:
                </span>
                <span className="text-xl font-bold text-gray-800">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-semibold text-gray-600">
                  {taxRates.gstLabel} ({(taxRates.gst * 100).toFixed(1)}%):
                </span>
                <span className="text-xl font-bold text-gray-800">
                  ${(total * taxRates.gst).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-600">
                  {taxRates.pstLabel} ({(taxRates.pst * 100).toFixed(1)}%):
                </span>
                <span className="text-xl font-bold text-gray-800">
                  ${(total * taxRates.pst).toFixed(2)}
                </span>
              </div>
              <div className="border-t-2 border-gray-300 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-700">
                    Total:
                  </span>
                  <span className="text-4xl font-bold text-[#FF6B35]">
                    ${(total * (1 + taxRates.gst + taxRates.pst)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="space-y-4 mt-6">
              <TouchButton
                onClick={() => handlePayment("card")}
                variant="primary"
                size="large"
                disabled={isProcessing}
                fullWidth
                aria-label="Pay with credit or debit card"
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={24} aria-hidden="true" />
                  <span>
                    {isProcessing ? "Processing..." : "Pay with Card"}
                  </span>
                </div>
              </TouchButton>

              <TouchButton
                onClick={() => handlePayment("cash")}
                variant="success"
                size="large"
                disabled={isProcessing}
                fullWidth
                aria-label="Pay with cash"
              >
                <div className="flex items-center justify-center gap-2">
                  <Banknote size={24} aria-hidden="true" />
                  <span>
                    {isProcessing ? "Processing..." : "Pay with Cash"}
                  </span>
                </div>
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
