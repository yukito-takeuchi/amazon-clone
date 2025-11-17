import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { createCheckoutSession, handleWebhook, confirmPayment } from '../controllers/stripeController';

const router = Router();

// Create checkout session (authenticated)
router.post('/create-checkout-session', authenticateUser, createCheckoutSession);

// Confirm payment and create order (authenticated)
router.post('/confirm-payment', authenticateUser, confirmPayment);

// Webhook endpoint (no auth required, Stripe signature verified in controller)
router.post('/webhook', handleWebhook);

export default router;
