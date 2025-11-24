import apiClient from './client';

export interface ProductRecommendation {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryId: number | null;
  score: number;
}

export interface RecommendationResponse {
  recommendations: ProductRecommendation[];
  source: string;
}

export const recommendationApi = {
  // Record product view
  recordView: async (productId: number): Promise<void> => {
    await apiClient.post('/recommendations/views', { productId });
  },

  // Get personalized recommendations for logged-in user
  getRecommendations: async (limit: number = 10): Promise<RecommendationResponse> => {
    const response = await apiClient.get(`/recommendations/user?limit=${limit}`);
    return response.data;
  },

  // Get similar products
  getSimilarProducts: async (productId: number, limit: number = 10): Promise<RecommendationResponse> => {
    const response = await apiClient.get(`/recommendations/similar/${productId}?limit=${limit}`);
    return response.data;
  },

  // Get popular products
  getPopularProducts: async (limit: number = 10): Promise<RecommendationResponse> => {
    const response = await apiClient.get(`/recommendations/popular?limit=${limit}`);
    return response.data;
  },

  // Get frequently viewed products
  getFrequentlyViewed: async (limit: number = 10, days: number = 30): Promise<RecommendationResponse> => {
    const response = await apiClient.get(`/recommendations/frequently-viewed?limit=${limit}&days=${days}`);
    return response.data;
  },
};
