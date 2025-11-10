-- Create product_images table for multiple images per product
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_product_display_order UNIQUE(product_id, display_order)
);

-- Create index for faster queries
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, display_order);

-- Migrate existing product images to product_images table
-- This will copy image_url from products table to product_images with display_order = 1
INSERT INTO product_images (product_id, image_url, display_order)
SELECT id, image_url, 1
FROM products
WHERE image_url IS NOT NULL AND image_url != '';

-- Note: We keep image_url column in products table for backward compatibility
-- It can be removed in a future migration if needed
