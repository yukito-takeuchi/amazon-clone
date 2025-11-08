import { apiClient } from './client';
import { Address } from '@/types/order';

export interface CreateAddressData {
  fullName: string;
  phoneNumber: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get('/addresses');
    return response.data.addresses;
  },

  getById: async (id: string): Promise<Address> => {
    const response = await apiClient.get(`/addresses/${id}`);
    return response.data.address;
  },

  create: async (data: CreateAddressData): Promise<Address> => {
    const response = await apiClient.post('/addresses', data);
    return response.data.address;
  },

  update: async (id: string, data: Partial<CreateAddressData>): Promise<Address> => {
    const response = await apiClient.put(`/addresses/${id}`, data);
    return response.data.address;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },
};
