-- Migration: 012_seed_reviews
-- Description: Seed review users and reviews for development

-- Clear existing reviews
TRUNCATE reviews CASCADE;

-- Insert/update review users (10 users including main user)
INSERT INTO users (firebase_uid, email, name, is_admin)
VALUES
  ('SxoAA9SOnfXQW4xPqBUbqhGohO12', 'test@example.com', 'Yukito Takeuchi', true),
  ('wDDB6Q8JnwdP1yP8AWED7n4EIli2', 'iyggf66974@yahoo.ne.jp', 'Taro Y.', false),
  ('wVMacbiB7oQ3QPsJXlhExPFvncW2', 'iyggf66974-2@yahoo.ne.jp', 'Hanako S.', false),
  ('C4F4bx8OqmZ6nMGveeTSKmFQ50F3', 'iyggf66974-3@yahoo.ne.jp', 'Ken M.', false),
  ('amNoRIK33SWKfBl37qKeLJj61XA3', 'iyggf66974-4@yahoo.ne.jp', 'Yuki T.', false),
  ('ZoduHM3IhxUhvcbtx0e63OQz0oo1', 'iyggf66974-5@yahoo.ne.jp', 'Sakura I.', false),
  ('YmrWDrVza9bbDUOxmxWj6u2iZTc2', 'iyggf66974-6@yahoo.ne.jp', 'Ryo K.', false),
  ('nVDNstyCfoTQiewAFZgZZSQY2JH3', 'iyggf66974-7@yahoo.ne.jp', 'Mika N.', false),
  ('jI3mot5x1If1nW0quotCpwIXpIG3', 'iyggf66974-8@yahoo.ne.jp', 'Kenji O.', false),
  ('ReSaU4ybqfMuTAxhfuaEELFrA4y2', 'iyggf66974-9@yahoo.ne.jp', 'Emi W.', false)
ON CONFLICT (firebase_uid) DO UPDATE SET name = EXCLUDED.name;

-- Create reviews for all products (10 reviews per product)
DO $$
DECLARE
  v_product RECORD;
  v_user_ids UUID[];
  v_user_id UUID;
  v_rating INTEGER;
  v_days_ago INTEGER;
  v_title TEXT;
  v_comment TEXT;
  v_titles TEXT[] := ARRAY[
    '期待通りの商品',
    '買ってよかった',
    'コスパ最高',
    '品質が良い',
    'おすすめです',
    'まあまあ',
    '普通',
    'イマイチ',
    '期待はずれ',
    '素晴らしい'
  ];
  v_positive_comments TEXT[] := ARRAY[
    'とても満足しています。品質が良く、長く使えそうです。',
    '価格以上の価値があります。友人にもおすすめしました。',
    '届くのも早く、梱包も丁寧でした。商品自体も期待通りです。',
    'デザインが気に入りました。実用性も高いです。',
    '使いやすくて気に入っています。買って正解でした。',
    'しっかりした作りで安心感があります。長く愛用できそうです。',
    '写真通りの商品でした。満足しています。',
    '家族も喜んでいます。プレゼントにも良いと思います。'
  ];
  v_neutral_comments TEXT[] := ARRAY[
    '可もなく不可もなく、普通の商品です。',
    '値段相応かなと思います。特に不満はありません。',
    '期待していたほどではありませんでしたが、使えます。',
    '悪くはないですが、もう少し改善の余地があるかも。'
  ];
  v_negative_comments TEXT[] := ARRAY[
    '期待していたものと少し違いました。',
    '品質がもう少し良ければ良かったです。',
    '価格の割には物足りない印象です。'
  ];
  i INTEGER;
BEGIN
  -- Get all user IDs (10 users)
  SELECT ARRAY_AGG(id) INTO v_user_ids
  FROM users
  WHERE firebase_uid IN (
    'SxoAA9SOnfXQW4xPqBUbqhGohO12',
    'wDDB6Q8JnwdP1yP8AWED7n4EIli2',
    'wVMacbiB7oQ3QPsJXlhExPFvncW2',
    'C4F4bx8OqmZ6nMGveeTSKmFQ50F3',
    'amNoRIK33SWKfBl37qKeLJj61XA3',
    'ZoduHM3IhxUhvcbtx0e63OQz0oo1',
    'YmrWDrVza9bbDUOxmxWj6u2iZTc2',
    'nVDNstyCfoTQiewAFZgZZSQY2JH3',
    'jI3mot5x1If1nW0quotCpwIXpIG3',
    'ReSaU4ybqfMuTAxhfuaEELFrA4y2'
  );

  -- Loop through each product
  FOR v_product IN SELECT id FROM products WHERE is_active = true LOOP
    -- Create 10 reviews per product
    FOR i IN 1..10 LOOP
      -- Random user
      v_user_id := v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::int];

      -- Random rating (weighted towards positive)
      v_rating := CASE
        WHEN random() < 0.4 THEN 5
        WHEN random() < 0.6 THEN 4
        WHEN random() < 0.8 THEN 3
        WHEN random() < 0.9 THEN 2
        ELSE 1
      END;

      -- Random days ago (1-365)
      v_days_ago := 1 + floor(random() * 365)::int;

      -- Title based on rating
      v_title := v_titles[1 + floor(random() * array_length(v_titles, 1))::int];

      -- Comment based on rating
      IF v_rating >= 4 THEN
        v_comment := v_positive_comments[1 + floor(random() * array_length(v_positive_comments, 1))::int];
      ELSIF v_rating = 3 THEN
        v_comment := v_neutral_comments[1 + floor(random() * array_length(v_neutral_comments, 1))::int];
      ELSE
        v_comment := v_negative_comments[1 + floor(random() * array_length(v_negative_comments, 1))::int];
      END IF;

      -- Insert review (ignore duplicates)
      BEGIN
        INSERT INTO reviews (user_id, product_id, rating, title, comment, created_at)
        VALUES (v_user_id, v_product.id, v_rating, v_title, v_comment, NOW() - (v_days_ago || ' days')::interval);
      EXCEPTION WHEN unique_violation THEN
        -- Skip duplicate user/product combination
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;
