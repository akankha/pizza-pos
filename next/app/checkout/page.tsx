'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import TouchButton from '@/components/TouchButton';
import OrderItemCard from '@/components/OrderItemCard';
import { ArrowLeft, CreditCard, DollarSign } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Cart is empty!');
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Order placed! Order #${data.data.orderNumber}`);
        clearCart();
        router.push('/');
      } else {
        alert('Failed to place order: ' + data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const total = getTotal();
  const tax = total * 0.13; // 13% tax
  const grandTotal = total + tax;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <TouchButton onClick={() => router.push('/new-order')} variant="secondary">
            <ArrowLeft className="inline mr-2" size={20} />
            Continue Shopping
          </TouchButton>
        </div>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-2xl text-gray-500 mb-6">Your cart is empty</p>
            <TouchButton onClick={() => router.push('/new-order')} variant="primary">
              Start New Order
            </TouchButton>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-2xl font-bold mb-4">Order Items</h2>
              {items.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (13%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <TouchButton
                    onClick={() => setPaymentMethod('cash')}
                    variant={paymentMethod === 'cash' ? 'primary' : 'secondary'}
                    className="w-full justify-start"
                  >
                    <DollarSign className="mr-2" size={20} />
                    Cash
                  </TouchButton>
                  <TouchButton
                    onClick={() => setPaymentMethod('card')}
                    variant={paymentMethod === 'card' ? 'primary' : 'secondary'}
                    className="w-full justify-start"
                  >
                    <CreditCard className="mr-2" size={20} />
                    Card
                  </TouchButton>
                </div>
              </div>

              <TouchButton
                onClick={handleCheckout}
                variant="success"
                size="lg"
                disabled={processing}
                className="w-full"
              >
                {processing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
              </TouchButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
