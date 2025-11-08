import { apiClient } from './client';
import { Order, CreateOrderData } from '@/types/order';

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export const ordersApi = {
  getAll: async (): Promise<OrdersResponse> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.order;
  },

  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data.order;
  },
};
