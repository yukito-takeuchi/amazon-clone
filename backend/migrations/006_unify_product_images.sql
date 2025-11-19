-- Unify product images to product_images table only
-- Add is_main flag and remove products.image_url

-- Step 1: Add is_main column to product_images
ALTER TABLE product_images ADD COLUMN is_main BOOLEAN DEFAULT FALSE;

-- Step 2: Set is_main = true for display_order = 1 (existing main images)
UPDATE product_images SET is_main = TRUE WHERE display_order = 1;

-- Step 3: Create index for faster main image queries
CREATE INDEX idx_product_images_main ON product_images(product_id, is_main) WHERE is_main = TRUE;

-- Step 4: Migrate any products.image_url that don't exist in product_images
INSERT INTO product_images (product_id, image_url, display_order, is_main)
SELECT p.id, p.image_url, 1, TRUE
FROM products p
WHERE p.image_url IS NOT NULL
  AND p.image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
  );

-- Step 5: Remove image_url column from products table
ALTER TABLE products DROP COLUMN IF EXISTS image_url;
