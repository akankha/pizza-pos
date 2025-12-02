import { create } from 'zustand';
import type { OrderItem } from '../shared/types';

interface CartStore {
  items: OrderItem[];
  addItem: (item: Partial<OrderItem> & Pick<OrderItem, 'type' | 'name' | 'price' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    const newItem: OrderItem = {
      ...item,
      id: crypto.randomUUID(),
      quantity: item.quantity || 1,
      subtotal: (item.price || 0) * (item.quantity || 1),
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.subtotal, 0);
  },
}));
