import apiClient from './client';
import { Review, ReviewSummary, CreateReviewData, UpdateReviewData } from '@/types/review';

export interface GetProductReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
}

export const reviewApi = {
  // Get all reviews for a product
  getProductReviews: async (productId: number): Promise<GetProductReviewsResponse> => {
    const response = await apiClient.get(`/products/${productId}/reviews`);
    return response.data;
  },

  // Get single review
  getReview: async (reviewId: number): Promise<{ review: Review }> => {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Create review
  createReview: async (productId: number, data: CreateReviewData): Promise<{ review: Review }> => {
    const response = await apiClient.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId: number, data: UpdateReviewData): Promise<{ review: Review }> => {
    const response = await apiClient.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // Upload review images
  uploadReviewImages: async (reviewId: number, files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    await apiClient.post(`/reviews/${reviewId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete review image
  deleteReviewImage: async (reviewId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}/images/${imageId}`);
  },
};
