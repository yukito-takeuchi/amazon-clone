'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cartApi } from '@/lib/api/cart';

/**
 * CartProvider - Fetches cart data when user is authenticated
 * Should be placed at app level to ensure cart is loaded on every page
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { setCart, setLoading } = useCartStore();

  useEffect(() => {
    const fetchCart = async () => {
      // Wait for auth to complete
      if (authLoading) {
        return;
      }

      // Only fetch cart if user is authenticated
      if (!isAuthenticated) {
        setCart(null);
        return;
      }

      setLoading(true);
      try {
        const cartData = await cartApi.getCart();
        setCart(cartData);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        // Set to null on error (user might not have a cart yet)
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, authLoading, setCart, setLoading]);

  return <>{children}</>;
}
