import { apiClient } from './client';

export interface CreateCheckoutSessionRequest {
  addressId: number;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface ConfirmPaymentRequest {
  sessionId: string;
}

export interface ConfirmPaymentResponse {
  message: string;
  order: {
    id: number;
    totalAmount: number;
    status: string;
  };
}

export const stripeApi = {
  createCheckoutSession: async (
    data: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> => {
    const response = await apiClient.post('/stripe/create-checkout-session', data);
    return response.data;
  },

  confirmPayment: async (
    data: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> => {
    const response = await apiClient.post('/stripe/confirm-payment', data);
    return response.data;
  },
};
