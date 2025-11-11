-- Add Stripe payment fields to orders table
ALTER TABLE orders
ADD COLUMN stripe_session_id VARCHAR(255),
ADD COLUMN stripe_payment_intent_id VARCHAR(255);

-- Create index for faster lookup by Stripe session ID
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Rollback (if needed)
-- ALTER TABLE orders
-- DROP COLUMN stripe_session_id,
-- DROP COLUMN stripe_payment_intent_id;
-- DROP INDEX idx_orders_stripe_session_id;
