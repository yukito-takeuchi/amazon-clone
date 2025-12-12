-- Migration: 010_seed_products
-- Description: Seed products for development

-- Clear existing products
TRUNCATE products CASCADE;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- 1. 本
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('プログラミング入門 Python編', 'Pythonの基礎から実践まで学べる入門書', 2800, 50, 1, true),
('ビジネス思考の教科書', '論理的思考力を鍛えるビジネス書', 1650, 30, 1, true),
('世界の歴史 全10巻セット', '世界史を網羅した決定版', 12000, 15, 1, true),
('最新JavaScript完全ガイド', 'ES2024対応の最新JS解説書', 3500, 40, 1, true),
('小説 夜明けの街', '感動の長編ミステリー小説', 1800, 60, 1, true),
('漫画 冒険者の日常 1-10巻', '人気ファンタジー漫画セット', 5500, 25, 1, true),
('TOEIC完全攻略 900点突破', '英語学習の決定版', 2200, 45, 1, true),
('料理の基本 和食編', '和食の基礎を学ぶレシピ本', 1980, 35, 1, true),
('心理学入門', '心理学の基礎を分かりやすく解説', 2400, 28, 1, true),
('写真集 日本の四季', '美しい日本の風景写真集', 4500, 20, 1, true);

-- 2. Kindleストア
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('電子書籍 AI時代の働き方', 'Kindle版ビジネス書', 1200, 999, 2, true),
('電子書籍 短編小説集', 'Kindle限定短編集', 500, 999, 2, true),
('電子書籍 英語学習帳', '毎日5分の英語学習', 800, 999, 2, true),
('電子書籍 投資入門', '初心者向け投資ガイド', 1500, 999, 2, true),
('電子書籍 健康レシピ100選', 'ヘルシー料理レシピ集', 980, 999, 2, true),
('電子書籍 漫画週刊誌', '最新号デジタル版', 350, 999, 2, true),
('電子書籍 プログラミング問題集', 'コーディング練習帳', 1800, 999, 2, true),
('電子書籍 旅行ガイド京都', '京都観光完全ガイド', 600, 999, 2, true);

-- 3. ミュージック
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('J-POP ベストアルバム 2024', '今年のヒット曲を収録', 3200, 100, 3, true),
('クラシック名曲集 CD5枚組', 'モーツァルト、ベートーヴェン他', 4500, 40, 3, true),
('ジャズ コレクション', 'ジャズの名盤セレクション', 2800, 35, 3, true),
('アニソン ベスト100', 'アニメソング人気曲集', 3500, 80, 3, true),
('洋楽 ロック名盤', '80年代ロックベスト', 2500, 45, 3, true),
('ヒーリングミュージック', 'リラックス用BGM集', 1800, 60, 3, true),
('アナログレコード ジャズ', 'ビンテージジャズLP', 5500, 15, 3, true),
('K-POP アルバム', '韓国アイドルグループ最新作', 2800, 90, 3, true);

-- 4. DVD・ブルーレイ
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('映画 アクション大作 BD', '話題のハリウッド映画', 4800, 50, 4, true),
('アニメ 人気シリーズ BOX', '全24話収録ブルーレイBOX', 25000, 20, 4, true),
('ドラマ 韓国ドラマ全集', '人気韓流ドラマDVD-BOX', 15000, 30, 4, true),
('ドキュメンタリー 自然の驚異', 'NHKスペシャル傑作選', 6800, 25, 4, true),
('お笑い DVD ベスト', '人気芸人コント集', 3500, 40, 4, true),
('ライブ映像 アーティストLIVE', '武道館ライブ収録', 7500, 35, 4, true),
('子供向け アニメ映画', 'ファミリー向けアニメ', 3200, 55, 4, true),
('ホラー映画 コレクション', '名作ホラー3本セット', 4200, 30, 4, true);

-- 5. TVゲーム
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('RPG 大冒険 Switch版', '100時間遊べる大作RPG', 7800, 60, 5, true),
('アクションゲーム PS5', '新作アクションアドベンチャー', 8500, 45, 5, true),
('レースゲーム', 'リアルドライビングシミュレーター', 6800, 40, 5, true),
('格闘ゲーム 最新作', '対戦格闘ゲーム決定版', 7200, 55, 5, true),
('Nintendo Switch 本体', '有機ELモデル', 37980, 20, 5, true),
('PlayStation 5', '次世代ゲーム機', 66980, 10, 5, true),
('ゲーミングコントローラー', 'プロ仕様コントローラー', 8800, 70, 5, true),
('ゲーミングヘッドセット', '7.1chサラウンド対応', 12000, 50, 5, true),
('パズルゲーム', '脳トレパズル集', 4800, 80, 5, true),
('スポーツゲーム サッカー', '最新サッカーゲーム', 7500, 65, 5, true);

-- 6. 家電＆カメラ
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('4K液晶テレビ 55インチ', '高画質4Kテレビ', 89800, 15, 6, true),
('ドラム式洗濯乾燥機', '省エネ大容量モデル', 198000, 8, 6, true),
('ミラーレス一眼カメラ', '高性能ミラーレス', 158000, 12, 6, true),
('エアコン 12畳用', '省エネインバーター', 98000, 20, 6, true),
('冷蔵庫 500L', '大容量ファミリーサイズ', 178000, 10, 6, true),
('電子レンジ オーブン機能付き', '多機能レンジ', 35000, 30, 6, true),
('掃除機 コードレス', '軽量パワフル掃除機', 45000, 40, 6, true),
('カメラレンズ 望遠', '200mm望遠レンズ', 68000, 15, 6, true),
('空気清浄機', 'HEPA フィルター搭載', 28000, 35, 6, true),
('炊飯器 圧力IH', '高級炊飯器', 55000, 25, 6, true);

-- 7. スマートフォン・携帯電話
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('スマートフォン 最新モデル', '6.7インチ有機EL', 128000, 30, 7, true),
('スマホケース 手帳型', '本革手帳型ケース', 3500, 100, 7, true),
('ワイヤレス充電器', '急速充電対応', 4500, 80, 7, true),
('スマホスタンド', '角度調整可能スタンド', 2200, 120, 7, true),
('モバイルバッテリー 20000mAh', '大容量モバイルバッテリー', 5800, 90, 7, true),
('USB-Cケーブル 2m', '急速充電対応ケーブル', 1500, 200, 7, true),
('画面保護フィルム', '強化ガラスフィルム', 1200, 150, 7, true),
('Bluetoothイヤホン', 'ノイズキャンセリング対応', 18000, 60, 7, true);

-- 8. パソコン・周辺機器
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('ノートPC 15インチ', 'Core i7 16GB RAM', 158000, 20, 8, true),
('ゲーミングPC', 'RTX4080搭載デスクトップ', 298000, 10, 8, true),
('4Kモニター 27インチ', 'IPSパネル高画質', 55000, 30, 8, true),
('メカニカルキーボード', '青軸ゲーミングキーボード', 12000, 50, 8, true),
('ゲーミングマウス', '高精度センサー搭載', 8500, 60, 8, true),
('外付けSSD 1TB', 'USB3.2 高速転送', 12800, 70, 8, true),
('Webカメラ 4K', 'テレワーク用高画質カメラ', 9800, 45, 8, true),
('プリンター 複合機', 'インクジェット複合機', 25000, 25, 8, true),
('WiFiルーター', 'Wi-Fi 6対応高速ルーター', 15800, 40, 8, true),
('PCスピーカー', '2.1chサラウンドスピーカー', 8800, 55, 8, true);

-- 9. PCソフト
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('オフィスソフト', 'ワープロ・表計算・プレゼンセット', 32800, 100, 9, true),
('セキュリティソフト 3年版', 'ウイルス対策ソフト', 9800, 150, 9, true),
('動画編集ソフト', 'プロ仕様動画編集', 25000, 60, 9, true),
('写真編集ソフト', 'RAW現像対応エディター', 18000, 70, 9, true),
('会計ソフト', '確定申告対応', 12800, 80, 9, true),
('CADソフト', '3D設計ソフトウェア', 98000, 20, 9, true),
('年賀状ソフト', '年賀状作成キット', 3800, 200, 9, true),
('タイピングソフト', 'タイピング練習ソフト', 2500, 100, 9, true);

-- 10. 文房具・オフィス用品
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('高級万年筆', 'ドイツ製万年筆', 25000, 20, 10, true),
('システム手帳 A5', '本革システム手帳', 8500, 40, 10, true),
('ボールペン 10本セット', '書きやすいゲルインク', 1200, 200, 10, true),
('デスクオーガナイザー', '多機能収納ボックス', 3500, 80, 10, true),
('ホワイトボード', '90x60cm マグネット対応', 5800, 30, 10, true),
('シュレッダー', 'クロスカット家庭用', 12000, 25, 10, true),
('ラミネーター', 'A3対応ラミネーター', 8800, 35, 10, true),
('ファイルキャビネット', '3段引き出し', 15800, 15, 10, true),
('蛍光ペン 20色セット', 'カラフル蛍光ペン', 1800, 150, 10, true),
('付箋 大量パック', 'ポストイット1000枚', 2200, 120, 10, true);

-- 11. おもちゃ
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('レゴ 大型セット', '1500ピース城セット', 15800, 25, 11, true),
('知育玩具 パズル', '木製知育パズル', 3500, 60, 11, true),
('ぬいぐるみ くま', '大きなテディベア', 5800, 50, 11, true),
('ラジコンカー', '4WDオフロード', 8500, 40, 11, true),
('フィギュア アニメキャラ', '人気アニメフィギュア', 12000, 30, 11, true),
('ボードゲーム 人生ゲーム', '家族で楽しめる', 4200, 70, 11, true),
('ドール ハウス', '家具付きドールハウス', 9800, 20, 11, true),
('電車 おもちゃセット', 'レール付き電車セット', 6500, 45, 11, true),
('ブロック 大容量', 'カラフルブロック500個', 4800, 55, 11, true),
('カードゲーム', 'トレーディングカード', 1500, 100, 11, true);

-- 12. ホビー
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('プラモデル 戦車', '1/35スケール戦車', 5500, 35, 12, true),
('プラモデル ガンダム', 'MG 1/100 ガンダム', 4800, 50, 12, true),
('模型用塗料セット', 'アクリル塗料12色', 3200, 80, 12, true),
('編み物キット', '初心者向けセーターキット', 4500, 40, 12, true),
('ダイヤモンドアート', '大型キャンバスキット', 3800, 60, 12, true),
('ミニチュアハウス', 'DIYドールハウスキット', 5200, 30, 12, true),
('エアブラシセット', '模型用エアブラシ', 15800, 20, 12, true),
('刺繍キット', '花柄刺繍セット', 2800, 70, 12, true),
('鉄道模型 Nゲージ', '電車セット', 25000, 15, 12, true),
('レジンクラフトキット', 'UVレジンスターターセット', 4200, 55, 12, true);

-- 13. 楽器・音響機器
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('エレキギター 初心者セット', 'アンプ付きセット', 25000, 20, 13, true),
('電子ピアノ 88鍵', '本格的なタッチ感', 85000, 12, 13, true),
('ワイヤレスヘッドホン', 'ハイレゾ対応', 35000, 40, 13, true),
('DJコントローラー', '初心者向けDJ機材', 28000, 25, 13, true),
('マイク コンデンサー', 'スタジオ録音用', 18000, 35, 13, true),
('ギターアンプ', '15W練習用アンプ', 12000, 30, 13, true),
('ドラムパッド', '電子ドラム練習用', 22000, 20, 13, true),
('ウクレレ', 'ハワイアンウクレレ', 8500, 45, 13, true),
('オーディオインターフェース', 'USB接続2ch', 15800, 30, 13, true),
('ギターエフェクター', 'マルチエフェクター', 25000, 25, 13, true);

-- 14. スポーツ＆アウトドア
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('テント 4人用', 'ファミリーキャンプ用', 25000, 30, 14, true),
('寝袋 冬用', '-10度対応シュラフ', 12000, 40, 14, true),
('ランニングシューズ', '軽量クッションシューズ', 15800, 60, 14, true),
('ヨガマット', '厚手10mm', 3500, 100, 14, true),
('ダンベルセット', '20kg可変式ダンベル', 18000, 35, 14, true),
('釣り竿セット', '初心者向けロッドセット', 8500, 45, 14, true),
('登山リュック 40L', '防水登山バッグ', 15000, 30, 14, true),
('自転車 クロスバイク', '21段変速', 45000, 15, 14, true),
('バーベキューコンロ', '折りたたみ式', 8800, 50, 14, true),
('サッカーボール 5号', '公式試合球', 5500, 70, 14, true);

-- 15. ゴルフ
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('ゴルフクラブセット', '初心者向け14本セット', 55000, 20, 15, true),
('ゴルフボール 1ダース', 'プロ仕様ボール', 4800, 100, 15, true),
('ゴルフシューズ', 'スパイクレスシューズ', 18000, 40, 15, true),
('キャディバッグ', '軽量スタンドバッグ', 25000, 25, 15, true),
('ゴルフグローブ', '本革グローブ', 2500, 80, 15, true),
('練習用ネット', '自宅練習用', 12000, 30, 15, true),
('レンジファインダー', 'GPS距離計', 28000, 20, 15, true),
('パター', 'マレット型パター', 15800, 35, 15, true);

-- 16. 自動車・バイク
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('カーナビ 7インチ', 'ポータブルナビ', 25000, 30, 16, true),
('ドライブレコーダー', '前後2カメラ', 18000, 50, 16, true),
('タイヤチェーン', '非金属チェーン', 12000, 40, 16, true),
('バイクヘルメット', 'フルフェイス', 28000, 25, 16, true),
('カーシート カバー', '防水シートカバー', 8500, 60, 16, true),
('車載空気清浄機', 'イオン発生器', 6800, 45, 16, true),
('バイクグローブ', '冬用防寒グローブ', 5500, 70, 16, true),
('ジャンプスターター', '緊急用バッテリー', 9800, 35, 16, true),
('洗車用品セット', 'コーティング剤付き', 4500, 80, 16, true),
('LEDヘッドライト', '車検対応H4', 8800, 50, 16, true);

-- 17. DIY・工具・ガーデン
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('電動ドライバー', '充電式インパクト', 12000, 40, 17, true),
('工具セット 100点', 'DIY用工具セット', 8500, 35, 17, true),
('芝刈り機', '電動芝刈り機', 25000, 20, 17, true),
('脚立 5段', 'アルミ製脚立', 8800, 30, 17, true),
('ガーデニングセット', '園芸用品10点', 3500, 60, 17, true),
('ペンキ 水性', '室内用白ペンキ4L', 4200, 50, 17, true),
('プランター 大型', 'テラコッタ風', 2800, 70, 17, true),
('電動のこぎり', '丸のこ165mm', 15800, 25, 17, true),
('散水ホース 20m', 'リール付きホース', 5500, 45, 17, true),
('作業手袋 10双', '耐切創手袋', 2200, 100, 17, true);

-- 18. 産業・研究開発用品
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('デジタルマルチメーター', '高精度測定器', 15800, 30, 18, true),
('オシロスコープ', '2ch 100MHz', 85000, 10, 18, true),
('安全ゴーグル', '実験用ゴーグル', 2500, 100, 18, true),
('白衣', '研究用白衣', 4500, 60, 18, true),
('ピペット セット', 'マイクロピペット', 25000, 20, 18, true),
('静電気対策マット', 'ESDマット', 8800, 35, 18, true),
('はんだごてセット', '温度調整付き', 6500, 50, 18, true),
('顕微鏡', '生物顕微鏡1000倍', 35000, 15, 18, true);

-- 19. ホーム＆キッチン
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('フライパンセット', 'IH対応3点セット', 8500, 50, 19, true),
('寝具セット シングル', '布団カバー3点', 6800, 40, 19, true),
('ソファ 3人掛け', '北欧風ソファ', 55000, 12, 19, true),
('収納ボックス 6個', '折りたたみ収納', 3200, 80, 19, true),
('包丁セット', '三徳・牛刀・ペティ', 12000, 35, 19, true),
('カーテン 遮光', '遮光1級 100x200', 5500, 60, 19, true),
('ラグ 2畳', 'ふわふわラグマット', 8800, 30, 19, true),
('食器セット', '4人用20ピース', 7500, 25, 19, true),
('観葉植物 モンステラ', 'インテリアグリーン', 4500, 40, 19, true),
('照明 ペンダントライト', 'LED対応おしゃれ照明', 9800, 35, 19, true);

-- 20. ドラッグストア
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('マルチビタミン 90日分', '総合ビタミンサプリ', 2500, 100, 20, true),
('目薬 10ml', '疲れ目対策', 980, 150, 20, true),
('絆創膏 100枚', '防水タイプ', 680, 200, 20, true),
('体温計 電子', '15秒検温', 2200, 80, 20, true),
('マスク 50枚入り', '不織布マスク', 980, 300, 20, true),
('鎮痛剤', '頭痛・生理痛に', 1200, 120, 20, true),
('胃腸薬', '食べ過ぎ・飲み過ぎに', 1500, 100, 20, true),
('プロテイン 1kg', 'ホエイプロテイン', 4500, 70, 20, true),
('コラーゲン サプリ', '美容サプリメント', 3200, 60, 20, true),
('入浴剤 30包', 'リラックス入浴剤', 1800, 90, 20, true);

-- 21. ビューティー
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('化粧水 150ml', '高保湿化粧水', 2800, 80, 21, true),
('日焼け止め SPF50', 'UVカットミルク', 1500, 120, 21, true),
('シャンプー ノンシリコン', 'オーガニックシャンプー', 2200, 90, 21, true),
('ファンデーション', 'リキッドファンデ', 3500, 60, 21, true),
('ヘアドライヤー', 'イオンドライヤー', 15800, 40, 21, true),
('美顔器', '超音波美顔器', 25000, 25, 21, true),
('ネイルセット', 'ジェルネイルキット', 4500, 50, 21, true),
('香水 50ml', 'フローラルの香り', 8500, 35, 21, true),
('メイクブラシセット', '12本セット', 3200, 70, 21, true),
('ヘアアイロン', 'ストレート&カール', 8800, 45, 21, true);

-- 22. 食品・飲料・お酒
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('コーヒー豆 1kg', 'ブラジル産アラビカ', 2800, 60, 22, true),
('日本酒 純米大吟醸', '720ml', 5500, 40, 22, true),
('ミネラルウォーター 24本', '2L×24本', 2500, 100, 22, true),
('チョコレート詰め合わせ', '高級チョコ20個', 3200, 50, 22, true),
('カップ麺 20個セット', '人気ラーメン詰め合わせ', 3500, 80, 22, true),
('ワイン 赤 フルボディ', 'フランス産750ml', 3800, 45, 22, true),
('おつまみセット', '乾き物詰め合わせ', 2200, 70, 22, true),
('緑茶 ペットボトル 24本', '500ml×24', 2800, 90, 22, true),
('クラフトビール 6本', '国産クラフト飲み比べ', 3500, 55, 22, true),
('お菓子 大袋', 'ファミリーパック', 980, 150, 22, true);

-- 23. ペット用品
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('ドッグフード 5kg', 'プレミアムドライフード', 4500, 50, 23, true),
('キャットタワー', '多機能猫タワー', 12000, 25, 23, true),
('ペットシーツ 100枚', 'レギュラーサイズ', 2500, 100, 23, true),
('犬用おもちゃ', 'ロープおもちゃセット', 1800, 80, 23, true),
('猫用トイレ', 'システムトイレ', 5500, 35, 23, true),
('ペットキャリー', '飛行機対応キャリー', 8500, 30, 23, true),
('犬用ベッド', 'ふわふわクッション', 4200, 45, 23, true),
('猫じゃらし 5本', '羽根付きおもちゃ', 980, 120, 23, true),
('ペット用ブラシ', 'スリッカーブラシ', 1500, 90, 23, true),
('犬用リード', '伸縮リード5m', 2800, 60, 23, true);

-- 24. ベビー・マタニティ
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('おむつ Mサイズ 84枚', 'テープタイプ', 2200, 100, 24, true),
('粉ミルク 800g', '0ヶ月から', 2800, 80, 24, true),
('ベビーカー', 'A型両対面式', 35000, 15, 24, true),
('チャイルドシート', '新生児対応', 28000, 20, 24, true),
('おしりふき 80枚×8個', '肌にやさしい', 1500, 150, 24, true),
('哺乳瓶 160ml', '耐熱ガラス製', 1800, 70, 24, true),
('ベビー服 5枚セット', '新生児肌着', 3200, 60, 24, true),
('離乳食 12個セット', '5ヶ月から', 2500, 90, 24, true),
('抱っこ紐', 'エルゴノミクス設計', 18000, 25, 24, true),
('ベビーモニター', 'カメラ付き見守り', 12000, 30, 24, true);

-- 25. ギフトカード
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('ギフトカード 3000円分', 'Amazonギフトカード', 3000, 999, 25, true),
('ギフトカード 5000円分', 'Amazonギフトカード', 5000, 999, 25, true),
('ギフトカード 10000円分', 'Amazonギフトカード', 10000, 999, 25, true),
('ギフトボックス入り 5000円', 'プレゼント用ギフト', 5000, 500, 25, true),
('グリーティングカード型 3000円', 'メッセージ付きギフト', 3000, 500, 25, true);

-- 26. ファッション
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('Tシャツ メンズ', 'コットン100% 白', 2500, 100, 26, true),
('ジーンズ レディース', 'スキニーデニム', 5800, 60, 26, true),
('ダウンジャケット', '軽量ダウン', 15800, 40, 26, true),
('スニーカー', '白スニーカー', 8500, 70, 26, true),
('ワンピース', 'フローラル柄', 6500, 50, 26, true),
('ビジネスシャツ', '形状記憶シャツ', 3500, 80, 26, true),
('パーカー', 'プルオーバーパーカー', 4800, 65, 26, true),
('スカート', 'プリーツスカート', 4200, 55, 26, true),
('コート ロング', 'ウールコート', 25000, 25, 26, true),
('ネクタイ シルク', 'ビジネス用', 5500, 45, 26, true);

-- 27. 腕時計
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('スマートウォッチ', '健康管理機能付き', 35000, 40, 27, true),
('腕時計 メンズ 自動巻き', 'ステンレス製', 45000, 20, 27, true),
('腕時計 レディース', 'クォーツ式', 18000, 35, 27, true),
('スポーツウォッチ', 'GPS内蔵', 28000, 30, 27, true),
('クラシック腕時計', 'レザーベルト', 25000, 25, 27, true),
('ダイバーズウォッチ', '200m防水', 55000, 15, 27, true),
('デジタルウォッチ', 'ソーラー電波', 15800, 45, 27, true),
('ペアウォッチ', '2本セット', 35000, 20, 27, true);

-- 28. ジュエリー
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('ネックレス シルバー', 'シンプルチェーン', 8500, 50, 28, true),
('ピアス ゴールド', 'フープピアス', 12000, 40, 28, true),
('リング ダイヤモンド', 'エンゲージリング', 150000, 10, 28, true),
('ブレスレット', 'チェーンブレスレット', 15000, 35, 28, true),
('イヤリング パール', '淡水パール', 6500, 45, 28, true),
('ペンダント ハート', 'シルバー925', 9800, 30, 28, true),
('アンクレット', 'ゴールドチェーン', 5500, 55, 28, true),
('ジュエリーボックス', '収納ケース', 4200, 40, 28, true);

-- 29. シューズ＆バッグ
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('ビジネスバッグ', '本革ブリーフケース', 25000, 30, 29, true),
('リュックサック', 'PC収納対応', 8500, 60, 29, true),
('パンプス', 'ヒール5cm', 7800, 50, 29, true),
('スーツケース L', '80L 4輪', 18000, 25, 29, true),
('ショルダーバッグ', 'レザーショルダー', 15000, 40, 29, true),
('ローファー', 'レザーローファー', 12000, 45, 29, true),
('トートバッグ', 'キャンバストート', 4500, 80, 29, true),
('ブーツ ロング', '本革ロングブーツ', 22000, 30, 29, true),
('ウォレット 長財布', '本革長財布', 18000, 35, 29, true),
('サンダル', 'コンフォートサンダル', 5500, 70, 29, true);

-- 30. Prime Video (デジタルサービスは在庫無制限)
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
('Prime Video レンタル アクション', '48時間視聴可能', 500, 999, 30, true),
('Prime Video レンタル コメディ', '48時間視聴可能', 500, 999, 30, true),
('Prime Video 購入 ドラマ', '無期限視聴', 2500, 999, 30, true),
('Prime Video レンタル アニメ', '48時間視聴可能', 400, 999, 30, true),
('Prime Video 購入 ドキュメンタリー', '無期限視聴', 1500, 999, 30, true);

-- Add product images from seed folder
INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES
(1, '/seed/books/1.jpg', TRUE, 1),
(2, '/seed/books/2.jpg', TRUE, 1),
(3, '/seed/books/3.jpg', TRUE, 1),
(4, '/seed/books/4.jpg', TRUE, 1),
(5, '/seed/books/5.jpg', TRUE, 1),
(6, '/seed/books/6.jpg', TRUE, 1),
(7, '/seed/books/7.jpg', TRUE, 1),
(8, '/seed/books/8.jpg', TRUE, 1),
(9, '/seed/books/9.jpg', TRUE, 1),
(10, '/seed/books/10.jpg', TRUE, 1),
(11, '/seed/kindle/1.jpg', TRUE, 1),
(12, '/seed/kindle/2.jpg', TRUE, 1),
(13, '/seed/kindle/3.jpg', TRUE, 1),
(14, '/seed/kindle/4.jpg', TRUE, 1),
(15, '/seed/kindle/5.jpg', TRUE, 1),
(16, '/seed/kindle/6.jpg', TRUE, 1),
(17, '/seed/kindle/7.jpg', TRUE, 1),
(18, '/seed/kindle/8.jpg', TRUE, 1),
(19, '/seed/music/1.jpg', TRUE, 1),
(20, '/seed/music/2.jpg', TRUE, 1),
(21, '/seed/music/3.jpg', TRUE, 1),
(22, '/seed/music/4.jpg', TRUE, 1),
(23, '/seed/music/5.jpg', TRUE, 1),
(24, '/seed/music/6.jpg', TRUE, 1),
(25, '/seed/music/7.jpg', TRUE, 1),
(26, '/seed/music/8.jpg', TRUE, 1),
(27, '/seed/dvd-bluray/1.jpg', TRUE, 1),
(28, '/seed/dvd-bluray/2.jpg', TRUE, 1),
(29, '/seed/dvd-bluray/3.jpg', TRUE, 1),
(30, '/seed/dvd-bluray/4.jpg', TRUE, 1),
(31, '/seed/dvd-bluray/5.jpg', TRUE, 1),
(32, '/seed/dvd-bluray/6.jpg', TRUE, 1),
(33, '/seed/dvd-bluray/7.jpg', TRUE, 1),
(34, '/seed/dvd-bluray/8.jpg', TRUE, 1),
(35, '/seed/games/1.jpg', TRUE, 1),
(36, '/seed/games/2.jpg', TRUE, 1),
(37, '/seed/games/3.jpg', TRUE, 1),
(38, '/seed/games/4.jpg', TRUE, 1),
(39, '/seed/games/5.jpg', TRUE, 1),
(40, '/seed/games/6.jpg', TRUE, 1),
(41, '/seed/games/7.jpg', TRUE, 1),
(42, '/seed/games/8.jpg', TRUE, 1),
(43, '/seed/games/9.jpg', TRUE, 1),
(44, '/seed/games/10.jpg', TRUE, 1),
(45, '/seed/electronics/1.jpg', TRUE, 1),
(46, '/seed/electronics/2.jpg', TRUE, 1),
(47, '/seed/electronics/3.jpg', TRUE, 1),
(48, '/seed/electronics/4.jpg', TRUE, 1),
(49, '/seed/electronics/5.jpg', TRUE, 1),
(50, '/seed/electronics/6.jpg', TRUE, 1),
(51, '/seed/electronics/7.jpg', TRUE, 1),
(52, '/seed/electronics/8.jpg', TRUE, 1),
(53, '/seed/electronics/9.jpg', TRUE, 1),
(54, '/seed/electronics/10.jpg', TRUE, 1),
(55, '/seed/smartphones/1.jpg', TRUE, 1),
(56, '/seed/smartphones/2.jpg', TRUE, 1),
(57, '/seed/smartphones/3.jpg', TRUE, 1),
(58, '/seed/smartphones/4.jpg', TRUE, 1),
(59, '/seed/smartphones/5.jpg', TRUE, 1),
(60, '/seed/smartphones/6.jpg', TRUE, 1),
(61, '/seed/smartphones/7.jpg', TRUE, 1),
(62, '/seed/smartphones/8.jpg', TRUE, 1),
(63, '/seed/computers/1.jpg', TRUE, 1),
(64, '/seed/computers/2.jpg', TRUE, 1),
(65, '/seed/computers/3.jpg', TRUE, 1),
(66, '/seed/computers/4.jpg', TRUE, 1),
(67, '/seed/computers/5.jpg', TRUE, 1),
(68, '/seed/computers/6.jpg', TRUE, 1),
(69, '/seed/computers/7.jpg', TRUE, 1),
(70, '/seed/computers/8.jpg', TRUE, 1),
(71, '/seed/computers/9.jpg', TRUE, 1),
(72, '/seed/computers/10.jpg', TRUE, 1),
(73, '/seed/software/1.jpg', TRUE, 1),
(74, '/seed/software/2.jpg', TRUE, 1),
(75, '/seed/software/3.jpg', TRUE, 1),
(76, '/seed/software/4.jpg', TRUE, 1),
(77, '/seed/software/5.jpg', TRUE, 1),
(78, '/seed/software/6.jpg', TRUE, 1),
(79, '/seed/software/7.jpg', TRUE, 1),
(80, '/seed/software/8.jpg', TRUE, 1),
(81, '/seed/stationery/1.jpg', TRUE, 1),
(82, '/seed/stationery/2.jpg', TRUE, 1),
(83, '/seed/stationery/3.jpg', TRUE, 1),
(84, '/seed/stationery/4.jpg', TRUE, 1),
(85, '/seed/stationery/5.jpg', TRUE, 1),
(86, '/seed/stationery/6.jpg', TRUE, 1),
(87, '/seed/stationery/7.jpg', TRUE, 1),
(88, '/seed/stationery/8.jpg', TRUE, 1),
(89, '/seed/stationery/9.jpg', TRUE, 1),
(90, '/seed/stationery/10.jpg', TRUE, 1),
(91, '/seed/toys/1.jpg', TRUE, 1),
(92, '/seed/toys/2.jpg', TRUE, 1),
(93, '/seed/toys/3.jpg', TRUE, 1),
(94, '/seed/toys/4.jpg', TRUE, 1),
(95, '/seed/toys/5.jpg', TRUE, 1),
(96, '/seed/toys/6.jpg', TRUE, 1),
(97, '/seed/toys/7.jpg', TRUE, 1),
(98, '/seed/toys/8.jpg', TRUE, 1),
(99, '/seed/toys/9.jpg', TRUE, 1),
(100, '/seed/toys/10.jpg', TRUE, 1),
(101, '/seed/hobby/1.jpg', TRUE, 1),
(102, '/seed/hobby/2.jpg', TRUE, 1),
(103, '/seed/hobby/3.jpg', TRUE, 1),
(104, '/seed/hobby/4.jpg', TRUE, 1),
(105, '/seed/hobby/5.jpg', TRUE, 1),
(106, '/seed/hobby/6.jpg', TRUE, 1),
(107, '/seed/hobby/7.jpg', TRUE, 1),
(108, '/seed/hobby/8.jpg', TRUE, 1),
(109, '/seed/hobby/9.jpg', TRUE, 1),
(110, '/seed/hobby/10.jpg', TRUE, 1),
(111, '/seed/musical-instruments/1.jpg', TRUE, 1),
(112, '/seed/musical-instruments/2.jpg', TRUE, 1),
(113, '/seed/musical-instruments/3.jpg', TRUE, 1),
(114, '/seed/musical-instruments/4.jpg', TRUE, 1),
(115, '/seed/musical-instruments/5.jpg', TRUE, 1),
(116, '/seed/musical-instruments/6.jpg', TRUE, 1),
(117, '/seed/musical-instruments/7.jpg', TRUE, 1),
(118, '/seed/musical-instruments/8.jpg', TRUE, 1),
(119, '/seed/musical-instruments/9.jpg', TRUE, 1),
(120, '/seed/musical-instruments/10.jpg', TRUE, 1),
(121, '/seed/sports-outdoors/1.jpg', TRUE, 1),
(122, '/seed/sports-outdoors/2.jpg', TRUE, 1),
(123, '/seed/sports-outdoors/3.jpg', TRUE, 1),
(124, '/seed/sports-outdoors/4.jpg', TRUE, 1),
(125, '/seed/sports-outdoors/5.jpg', TRUE, 1),
(126, '/seed/sports-outdoors/6.jpg', TRUE, 1),
(127, '/seed/sports-outdoors/7.jpg', TRUE, 1),
(128, '/seed/sports-outdoors/8.jpg', TRUE, 1),
(129, '/seed/sports-outdoors/9.jpg', TRUE, 1),
(130, '/seed/sports-outdoors/10.jpg', TRUE, 1),
(131, '/seed/golf/1.jpg', TRUE, 1),
(132, '/seed/golf/2.jpg', TRUE, 1),
(133, '/seed/golf/3.jpg', TRUE, 1),
(134, '/seed/golf/4.jpg', TRUE, 1),
(135, '/seed/golf/5.jpg', TRUE, 1),
(136, '/seed/golf/6.jpg', TRUE, 1),
(137, '/seed/golf/7.jpg', TRUE, 1),
(138, '/seed/golf/8.jpg', TRUE, 1),
(139, '/seed/automotive/1.jpg', TRUE, 1),
(140, '/seed/automotive/2.jpg', TRUE, 1),
(141, '/seed/automotive/3.jpg', TRUE, 1),
(142, '/seed/automotive/4.jpg', TRUE, 1),
(143, '/seed/automotive/5.jpg', TRUE, 1),
(144, '/seed/automotive/6.jpg', TRUE, 1),
(145, '/seed/automotive/7.jpg', TRUE, 1),
(146, '/seed/automotive/8.jpg', TRUE, 1),
(147, '/seed/automotive/9.jpg', TRUE, 1),
(148, '/seed/automotive/10.jpg', TRUE, 1),
(149, '/seed/diy-tools-garden/1.jpg', TRUE, 1),
(150, '/seed/diy-tools-garden/2.jpg', TRUE, 1),
(151, '/seed/diy-tools-garden/3.jpg', TRUE, 1),
(152, '/seed/diy-tools-garden/4.jpg', TRUE, 1),
(153, '/seed/diy-tools-garden/5.jpg', TRUE, 1),
(154, '/seed/diy-tools-garden/6.jpg', TRUE, 1),
(155, '/seed/diy-tools-garden/7.jpg', TRUE, 1),
(156, '/seed/diy-tools-garden/8.jpg', TRUE, 1),
(157, '/seed/diy-tools-garden/9.jpg', TRUE, 1),
(158, '/seed/diy-tools-garden/10.jpg', TRUE, 1),
(159, '/seed/industrial/1.jpg', TRUE, 1),
(160, '/seed/industrial/2.jpg', TRUE, 1),
(161, '/seed/industrial/3.jpg', TRUE, 1),
(162, '/seed/industrial/4.jpg', TRUE, 1),
(163, '/seed/industrial/5.jpg', TRUE, 1),
(164, '/seed/industrial/6.jpg', TRUE, 1),
(165, '/seed/industrial/7.jpg', TRUE, 1),
(166, '/seed/industrial/8.jpg', TRUE, 1),
(167, '/seed/home-kitchen/1.jpg', TRUE, 1),
(168, '/seed/home-kitchen/2.jpg', TRUE, 1),
(169, '/seed/home-kitchen/3.jpg', TRUE, 1),
(170, '/seed/home-kitchen/4.jpg', TRUE, 1),
(171, '/seed/home-kitchen/5.jpg', TRUE, 1),
(172, '/seed/home-kitchen/6.jpg', TRUE, 1),
(173, '/seed/home-kitchen/7.jpg', TRUE, 1),
(174, '/seed/home-kitchen/8.jpg', TRUE, 1),
(175, '/seed/home-kitchen/9.jpg', TRUE, 1),
(176, '/seed/home-kitchen/10.jpg', TRUE, 1),
(177, '/seed/drugstore/1.jpg', TRUE, 1),
(178, '/seed/drugstore/2.jpg', TRUE, 1),
(179, '/seed/drugstore/3.jpg', TRUE, 1),
(180, '/seed/drugstore/4.jpg', TRUE, 1),
(181, '/seed/drugstore/5.jpg', TRUE, 1),
(182, '/seed/drugstore/6.jpg', TRUE, 1),
(183, '/seed/drugstore/7.jpg', TRUE, 1),
(184, '/seed/drugstore/8.jpg', TRUE, 1),
(185, '/seed/drugstore/9.jpg', TRUE, 1),
(186, '/seed/drugstore/10.jpg', TRUE, 1),
(187, '/seed/beauty/1.jpg', TRUE, 1),
(188, '/seed/beauty/2.jpg', TRUE, 1),
(189, '/seed/beauty/3.jpg', TRUE, 1),
(190, '/seed/beauty/4.jpg', TRUE, 1),
(191, '/seed/beauty/5.jpg', TRUE, 1),
(192, '/seed/beauty/6.jpg', TRUE, 1),
(193, '/seed/beauty/7.jpg', TRUE, 1),
(194, '/seed/beauty/8.jpg', TRUE, 1),
(195, '/seed/beauty/9.jpg', TRUE, 1),
(196, '/seed/beauty/10.jpg', TRUE, 1),
(197, '/seed/food-beverages/1.jpg', TRUE, 1),
(198, '/seed/food-beverages/2.jpg', TRUE, 1),
(199, '/seed/food-beverages/3.jpg', TRUE, 1),
(200, '/seed/food-beverages/4.jpg', TRUE, 1),
(201, '/seed/food-beverages/5.jpg', TRUE, 1),
(202, '/seed/food-beverages/6.jpg', TRUE, 1),
(203, '/seed/food-beverages/7.jpg', TRUE, 1),
(204, '/seed/food-beverages/8.jpg', TRUE, 1),
(205, '/seed/food-beverages/9.jpg', TRUE, 1),
(206, '/seed/food-beverages/10.jpg', TRUE, 1),
(207, '/seed/pet-supplies/1.jpg', TRUE, 1),
(208, '/seed/pet-supplies/2.jpg', TRUE, 1),
(209, '/seed/pet-supplies/3.jpg', TRUE, 1),
(210, '/seed/pet-supplies/4.jpg', TRUE, 1),
(211, '/seed/pet-supplies/5.jpg', TRUE, 1),
(212, '/seed/pet-supplies/6.jpg', TRUE, 1),
(213, '/seed/pet-supplies/7.jpg', TRUE, 1),
(214, '/seed/pet-supplies/8.jpg', TRUE, 1),
(215, '/seed/pet-supplies/9.jpg', TRUE, 1),
(216, '/seed/pet-supplies/10.jpg', TRUE, 1),
(217, '/seed/baby-maternity/1.jpg', TRUE, 1),
(218, '/seed/baby-maternity/2.jpg', TRUE, 1),
(219, '/seed/baby-maternity/3.jpg', TRUE, 1),
(220, '/seed/baby-maternity/4.jpg', TRUE, 1),
(221, '/seed/baby-maternity/5.jpg', TRUE, 1),
(222, '/seed/baby-maternity/6.jpg', TRUE, 1),
(223, '/seed/baby-maternity/7.jpg', TRUE, 1),
(224, '/seed/baby-maternity/8.jpg', TRUE, 1),
(225, '/seed/baby-maternity/9.jpg', TRUE, 1),
(226, '/seed/baby-maternity/10.jpg', TRUE, 1),
(227, '/seed/gift-cards/1.jpg', TRUE, 1),
(228, '/seed/gift-cards/2.jpg', TRUE, 1),
(229, '/seed/gift-cards/3.jpg', TRUE, 1),
(230, '/seed/gift-cards/4.jpg', TRUE, 1),
(231, '/seed/gift-cards/5.jpg', TRUE, 1),
(232, '/seed/fashion/1.jpg', TRUE, 1),
(233, '/seed/fashion/2.jpg', TRUE, 1),
(234, '/seed/fashion/3.jpg', TRUE, 1),
(235, '/seed/fashion/4.jpg', TRUE, 1),
(236, '/seed/fashion/5.jpg', TRUE, 1),
(237, '/seed/fashion/6.jpg', TRUE, 1),
(238, '/seed/fashion/7.jpg', TRUE, 1),
(239, '/seed/fashion/8.jpg', TRUE, 1),
(240, '/seed/fashion/9.jpg', TRUE, 1),
(241, '/seed/fashion/10.jpg', TRUE, 1),
(242, '/seed/watches/1.jpg', TRUE, 1),
(243, '/seed/watches/2.jpg', TRUE, 1),
(244, '/seed/watches/3.jpg', TRUE, 1),
(245, '/seed/watches/4.jpg', TRUE, 1),
(246, '/seed/watches/5.jpg', TRUE, 1),
(247, '/seed/watches/6.jpg', TRUE, 1),
(248, '/seed/watches/7.jpg', TRUE, 1),
(249, '/seed/watches/8.jpg', TRUE, 1),
(250, '/seed/jewelry/1.jpg', TRUE, 1),
(251, '/seed/jewelry/2.jpg', TRUE, 1),
(252, '/seed/jewelry/3.jpg', TRUE, 1),
(253, '/seed/jewelry/4.jpg', TRUE, 1),
(254, '/seed/jewelry/5.jpg', TRUE, 1),
(255, '/seed/jewelry/6.jpg', TRUE, 1),
(256, '/seed/jewelry/7.jpg', TRUE, 1),
(257, '/seed/jewelry/8.jpg', TRUE, 1),
(258, '/seed/shoes-bags/1.jpg', TRUE, 1),
(259, '/seed/shoes-bags/2.jpg', TRUE, 1),
(260, '/seed/shoes-bags/3.jpg', TRUE, 1),
(261, '/seed/shoes-bags/4.jpg', TRUE, 1),
(262, '/seed/shoes-bags/5.jpg', TRUE, 1),
(263, '/seed/shoes-bags/6.jpg', TRUE, 1),
(264, '/seed/shoes-bags/7.jpg', TRUE, 1),
(265, '/seed/shoes-bags/8.jpg', TRUE, 1),
(266, '/seed/shoes-bags/9.jpg', TRUE, 1),
(267, '/seed/shoes-bags/10.jpg', TRUE, 1),
(268, '/seed/prime-video/1.jpg', TRUE, 1),
(269, '/seed/prime-video/2.jpg', TRUE, 1),
(270, '/seed/prime-video/3.jpg', TRUE, 1),
(271, '/seed/prime-video/4.jpg', TRUE, 1),
(272, '/seed/prime-video/5.jpg', TRUE, 1);
