import { apiClient } from './client';

export interface CreateCheckoutSessionRequest {
  addressId: number;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const stripeApi = {
  createCheckoutSession: async (
    data: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> => {
    const response = await apiClient.post('/stripe/create-checkout-session', data);
    return response.data;
  },
};
