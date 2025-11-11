import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { createCheckoutSession, handleWebhook } from '../controllers/stripeController';

const router = Router();

// Create checkout session (authenticated)
router.post('/create-checkout-session', authenticateUser, createCheckoutSession);

// Webhook endpoint (no auth required, Stripe signature verified in controller)
router.post('/webhook', handleWebhook);

export default router;
