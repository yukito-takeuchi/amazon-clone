import { create } from 'zustand';
import { Cart } from '@/types/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  setCart: (cart: Cart | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  setCart: (cart) => set({ cart, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearCart: () => set({ cart: null }),
}));
