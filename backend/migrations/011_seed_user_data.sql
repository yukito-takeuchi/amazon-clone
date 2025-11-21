-- Migration: 011_seed_user_data
-- Description: Seed user data for development (orders, reviews, views)
-- User: test@example.com (firebase_uid: SxoAA9SOnfXQW4xPqBUbqhGohO12)

-- Clear existing user-related data
TRUNCATE orders CASCADE;
TRUNCATE reviews CASCADE;
TRUNCATE product_views CASCADE;
TRUNCATE carts CASCADE;
TRUNCATE addresses CASCADE;

-- Reset sequences
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE addresses_id_seq RESTART WITH 1;
ALTER SEQUENCE carts_id_seq RESTART WITH 1;

-- Ensure test user exists
INSERT INTO users (firebase_uid, email, name, is_admin)
VALUES ('SxoAA9SOnfXQW4xPqBUbqhGohO12', 'test@example.com', 'テストユーザー', false)
ON CONFLICT (firebase_uid) DO UPDATE SET name = 'テストユーザー';

-- Get user_id
DO $$
DECLARE
  v_user_id UUID;
  v_address_id INTEGER;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE firebase_uid = 'SxoAA9SOnfXQW4xPqBUbqhGohO12';

  -- Add addresses
  INSERT INTO addresses (user_id, postal_code, prefecture, city, address_line, building, phone_number, is_default, full_name)
  VALUES
    (v_user_id, '100-0001', '東京都', '千代田区', '丸の内1-1-1', 'テストビル101', '03-1234-5678', true, 'テスト 太郎'),
    (v_user_id, '530-0001', '大阪府', '大阪市北区', '梅田2-2-2', 'サンプルマンション202', '06-1234-5678', false, 'テスト 太郎');

  -- Get default address
  SELECT id INTO v_address_id FROM addresses WHERE user_id = v_user_id AND is_default = true LIMIT 1;

  -- Create orders (様々なステータス)
  -- 1. 配送済み注文
  INSERT INTO orders (user_id, address_id, total_amount, status, payment_method, stripe_payment_intent_id, created_at)
  VALUES (v_user_id, v_address_id, 15800, 'delivered', 'card', 'pi_test_001', NOW() - INTERVAL '30 days');

  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 1, id, 1, price FROM products WHERE id = 1;

  -- 2. 配送済み注文
  INSERT INTO orders (user_id, address_id, total_amount, status, payment_method, stripe_payment_intent_id, created_at)
  VALUES (v_user_id, v_address_id, 89800, 'delivered', 'card', 'pi_test_002', NOW() - INTERVAL '20 days');

  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 2, id, 1, price FROM products WHERE id = 41;

  -- 3. 発送済み注文
  INSERT INTO orders (user_id, address_id, total_amount, status, payment_method, stripe_payment_intent_id, created_at)
  VALUES (v_user_id, v_address_id, 7800, 'shipped', 'card', 'pi_test_003', NOW() - INTERVAL '5 days');

  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 3, id, 1, price FROM products WHERE id = 31;

  -- 4. 確認済み注文
  INSERT INTO orders (user_id, address_id, total_amount, status, payment_method, stripe_payment_intent_id, created_at)
  VALUES (v_user_id, v_address_id, 25000, 'confirmed', 'card', 'pi_test_004', NOW() - INTERVAL '2 days');

  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 4, id, 1, price FROM products WHERE id = 81;

  -- 5. 複数商品の注文
  INSERT INTO orders (user_id, address_id, total_amount, status, payment_method, stripe_payment_intent_id, created_at)
  VALUES (v_user_id, v_address_id, 12300, 'delivered', 'card', 'pi_test_005', NOW() - INTERVAL '15 days');

  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 5, id, 2, price FROM products WHERE id = 5;
  INSERT INTO order_items (order_id, product_id, quantity, price)
  SELECT 5, id, 1, price FROM products WHERE id = 10;

  -- Add reviews (配送済み商品にレビュー)
  INSERT INTO reviews (user_id, product_id, rating, title, comment, created_at)
  VALUES
    (v_user_id, 1, 5, '素晴らしい本です', 'Python初心者にとても分かりやすい内容でした。実践的な例も多く、すぐに活用できました。', NOW() - INTERVAL '25 days'),
    (v_user_id, 41, 4, '画質が綺麗', '4Kテレビの画質は期待通り。サイズも部屋にぴったりでした。', NOW() - INTERVAL '15 days');

  -- Add product views (閲覧履歴)
  INSERT INTO product_views (user_id, product_id, view_count, viewed_at)
  VALUES
    (v_user_id, 1, 5, NOW() - INTERVAL '1 day'),
    (v_user_id, 2, 3, NOW() - INTERVAL '2 days'),
    (v_user_id, 5, 2, NOW() - INTERVAL '3 days'),
    (v_user_id, 10, 1, NOW() - INTERVAL '4 days'),
    (v_user_id, 31, 4, NOW() - INTERVAL '1 day'),
    (v_user_id, 41, 6, NOW() - INTERVAL '5 days'),
    (v_user_id, 51, 2, NOW() - INTERVAL '6 days'),
    (v_user_id, 61, 1, NOW() - INTERVAL '7 days'),
    (v_user_id, 71, 3, NOW() - INTERVAL '2 days'),
    (v_user_id, 81, 2, NOW() - INTERVAL '1 day');

  -- Create cart with items
  INSERT INTO carts (user_id) VALUES (v_user_id);

  INSERT INTO cart_items (cart_id, product_id, quantity)
  SELECT c.id, 21, 1 FROM carts c WHERE c.user_id = v_user_id;
  INSERT INTO cart_items (cart_id, product_id, quantity)
  SELECT c.id, 22, 2 FROM carts c WHERE c.user_id = v_user_id;

END $$;
