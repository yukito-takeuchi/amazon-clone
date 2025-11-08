import { apiClient } from './client';
import { Cart } from '@/types/cart';

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart');
    return response.data.cart;
  },

  addItem: async (data: AddToCartData): Promise<Cart> => {
    const response = await apiClient.post('/cart/items', data);
    return response.data.cart;
  },

  updateItem: async (productId: string, data: UpdateCartItemData): Promise<Cart> => {
    const response = await apiClient.put(`/cart/items/${productId}`, data);
    return response.data.cart;
  },

  removeItem: async (productId: string): Promise<Cart> => {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data.cart;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },
};
