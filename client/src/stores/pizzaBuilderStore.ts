import { create } from 'zustand';
import type { PizzaSizeName, CrustType } from '../../../shared/types';

interface PizzaBuilderStore {
  selectedSize: PizzaSizeName | null;
  selectedCrust: CrustType | null;
  selectedToppings: string[];
  setSize: (size: PizzaSizeName) => void;
  setCrust: (crust: CrustType) => void;
  toggleTopping: (toppingId: string) => void;
  reset: () => void;
  isComplete: () => boolean;
}

export const usePizzaBuilderStore = create<PizzaBuilderStore>((set, get) => ({
  selectedSize: null,
  selectedCrust: null,
  selectedToppings: [],
  
  setSize: (size) => set({ selectedSize: size }),
  
  setCrust: (crust) => set({ selectedCrust: crust }),
  
  toggleTopping: (toppingId) => {
    set((state) => {
      const isSelected = state.selectedToppings.includes(toppingId);
      return {
        selectedToppings: isSelected
          ? state.selectedToppings.filter((id) => id !== toppingId)
          : [...state.selectedToppings, toppingId],
      };
    });
  },
  
  reset: () => set({
    selectedSize: null,
    selectedCrust: null,
    selectedToppings: [],
  }),
  
  isComplete: () => {
    const state = get();
    return state.selectedSize !== null && state.selectedCrust !== null;
  },
}));
