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

// Transform backend snake_case response to frontend camelCase
const transformProduct = (backendProduct: any): Product => ({
  id: String(backendProduct.id),
  name: backendProduct.name,
  description: backendProduct.description,
  price: parseFloat(backendProduct.price),
  stock: backendProduct.stock,
  categoryId: String(backendProduct.category_id),
  imageUrl: backendProduct.imageUrl || backendProduct.image_url || null,
  images: backendProduct.images
    ? backendProduct.images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl || img.url || img.image_url,
        displayOrder: img.displayOrder || img.display_order || 0,
      }))
    : [],
  isActive: backendProduct.is_active,
  createdAt: backendProduct.created_at,
  updatedAt: backendProduct.updated_at,
});

export const adminApi = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data.categories.map((cat: any) => ({
      id: String(cat.id),
      name: cat.name,
      description: cat.description,
    }));
  },

  // Products
  createProduct: async (data: CreateProductData): Promise<Product> => {
    // Step 1: Create the product with JSON data
    const response = await apiClient.post('/admin/products', {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
    });

    const product = transformProduct(response.data.product);

    // Step 2: Upload image if provided
    if (data.image && product.id) {
      const formData = new FormData();
      formData.append('image', data.image);

      const imageResponse = await apiClient.post(
        `/admin/products/${product.id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Return product with updated image URL
      return { ...product, imageUrl: imageResponse.data.imageUrl || imageResponse.data.image_url };
    }

    return product;
  },

  updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
    // Step 1: Update the product data with JSON
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.categoryId) updateData.categoryId = data.categoryId;

    const response = await apiClient.put(`/admin/products/${id}`, updateData);
    let product = transformProduct(response.data.product);

    // Step 2: Upload image if provided
    if (data.image) {
      const formData = new FormData();
      formData.append('image', data.image);

      const imageResponse = await apiClient.post(
        `/admin/products/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Return product with updated image URL
      product = { ...product, imageUrl: imageResponse.data.imageUrl || imageResponse.data.image_url };
    }

    return product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return transformProduct(response.data.product);
  },

  getAllProducts: async (page: number = 1, limit: number = 20): Promise<{ products: Product[]; hasMore: boolean }> => {
    const response = await apiClient.get(`/admin/products?page=${page}&limit=${limit}`);
    const products = response.data.products.map(transformProduct);
    const { pagination } = response.data;
    const hasMore = pagination ? pagination.page < pagination.totalPages : false;
    return { products, hasMore };
  },

  // Multiple Images
  uploadProductImages: async (productId: string, images: File[]): Promise<void> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    await apiClient.post(`/admin/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteProductImage: async (productId: string, imageId: number): Promise<void> => {
    await apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  setMainImage: async (productId: string, imageId: number): Promise<void> => {
    await apiClient.put(`/admin/products/${productId}/images/${imageId}/main`);
  },
};
