import { apiClient } from './client';
import { Product } from '@/types/product';
import { Category } from '@/types/product';

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  image?: File;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const adminApi = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data.categories;
  },

  // Products
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('categoryId', data.categoryId);

    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.product;
  },

  updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data.product;
  },

  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/admin/products');
    return response.data.products;
  },
};
