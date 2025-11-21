-- Reset database for development
-- WARNING: This will delete ALL data!

-- Truncate all tables (cascade deletes related data)
TRUNCATE users CASCADE;
TRUNCATE categories CASCADE;
TRUNCATE products CASCADE;
TRUNCATE migrations CASCADE;

-- Reset all sequences
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE addresses_id_seq RESTART WITH 1;
ALTER SEQUENCE carts_id_seq RESTART WITH 1;
ALTER SEQUENCE cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE product_images_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE product_views_id_seq RESTART WITH 1;

SELECT 'Database reset complete!' as status;
