-- Fix decimal columns to integer for JPY (no decimal places needed)

-- Update orders table
ALTER TABLE orders
ALTER COLUMN total_amount TYPE INTEGER USING ROUND(total_amount)::INTEGER;

-- Update order_items table
ALTER TABLE order_items
ALTER COLUMN price TYPE INTEGER USING ROUND(price)::INTEGER;

-- Update products table (if needed)
ALTER TABLE products
ALTER COLUMN price TYPE INTEGER USING ROUND(price)::INTEGER;
