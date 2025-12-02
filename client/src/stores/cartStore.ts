import { create } from 'zustand';
import type { OrderItem } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

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
      id: uuidv4(),
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
}));
