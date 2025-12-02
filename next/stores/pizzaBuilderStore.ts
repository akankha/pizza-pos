import { create } from 'zustand';

interface PizzaBuilderStore {
  size: string;
  crust: string;
  toppings: string[];
  setSize: (size: string) => void;
  setCrust: (crust: string) => void;
  toggleTopping: (topping: string) => void;
  reset: () => void;
}

export const usePizzaBuilderStore = create<PizzaBuilderStore>((set) => ({
  size: '',
  crust: '',
  toppings: [],
  
  setSize: (size) => set({ size }),
  setCrust: (crust) => set({ crust }),
  toggleTopping: (topping) =>
    set((state) => ({
      toppings: state.toppings.includes(topping)
        ? state.toppings.filter((t) => t !== topping)
        : [...state.toppings, topping],
    })),
  reset: () => set({ size: '', crust: '', toppings: [] }),
}));
