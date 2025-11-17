import Stripe from 'stripe';

// Use dummy key for development if not set
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_please_replace_with_real_key';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Warn if using dummy key
if (STRIPE_SECRET_KEY === 'sk_test_dummy_key_please_replace_with_real_key') {
  console.warn('⚠️  WARNING: Using dummy Stripe key. Please set STRIPE_SECRET_KEY in .env file');
}
