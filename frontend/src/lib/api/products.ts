import { apiClient } from './client';
import { Product, ProductFilters } from '@/types/product';

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Transform backend snake_case response to frontend camelCase
const transformProduct = (backendProduct: any): Product => ({
  id: String(backendProduct.id),
  name: backendProduct.name,
  description: backendProduct.description,
  price: parseFloat(backendProduct.price),
  stock: backendProduct.stock,
  categoryId: String(backendProduct.category_id),
  imageUrl: backendProduct.imageUrl || backendProduct.image_url || null,
  images: backendProduct.images || [],
  isActive: backendProduct.is_active,
  createdAt: backendProduct.created_at,
  updatedAt: backendProduct.updated_at,
});

export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('category', filters.categoryId);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.inStock !== undefined) params.append('inStock', filters.inStock.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/products?${params.toString()}`);
    return {
      products: response.data.products.map(transformProduct),
      total: response.data.pagination?.total || response.data.total || 0,
      page: response.data.pagination?.page || response.data.page || 1,
      totalPages: response.data.pagination?.totalPages || response.data.totalPages || 1,
    };
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return transformProduct(response.data.product);
  },
};
