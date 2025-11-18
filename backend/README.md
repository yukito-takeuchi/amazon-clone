# E-Commerce Backend API

Next.js + Express + PostgreSQL で構築したECサイトのバックエンドAPI

## 技術スタック

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (データベース)
- **Firebase Authentication** (認証)
- **Google Cloud Storage** (本番環境での画像保存)
- **Docker** (開発環境)

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/amazon_clone

# CORS（複数のオリジンはカンマ区切りで指定可能）
# 例: CORS_ORIGIN=http://localhost:3000,https://yourdomain.vercel.app
CORS_ORIGIN=http://localhost:3000

# Firebase設定（オプション - 認証機能を使う場合）
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# GCS設定（本番環境のみ）
GCS_BUCKET_NAME=your-bucket-name
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 3. Dockerでデータベースを起動

プロジェクトルートで：

```bash
docker-compose up -d
```

### 4. データベースマイグレーション

```bash
# マイグレーション実行
npm run db:migrate up

# または、PostgreSQLに直接接続してSQLを実行
docker exec -i amazon_clone_db psql -U postgres -d amazon_clone < migrations/001_initial_schema.sql
```

### 5. シードデータ投入（オプション）

```bash
npm run db:seed
```

### 6. 開発サーバー起動

```bash
npm run dev
```

サーバーは `http://localhost:3001` で起動します。

## API エンドポイント

### 認証 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/api/auth/register` | ユーザー登録 | - |
| GET | `/api/auth/me` | 現在のユーザー情報取得 | 必須 |

### ユーザー・プロフィール API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/users/profile` | プロフィール取得 | 必須 |
| PUT | `/api/users/profile` | プロフィール更新 | 必須 |
| POST | `/api/users/profile/avatar` | プロフィール画像アップロード | 必須 |

### 配送先住所 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/addresses` | 住所一覧取得 | 必須 |
| POST | `/api/addresses` | 住所追加 | 必須 |
| PUT | `/api/addresses/:id` | 住所更新 | 必須 |
| DELETE | `/api/addresses/:id` | 住所削除 | 必須 |

### 商品 API（公開）

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/products` | 商品一覧取得 | - |
| GET | `/api/products/:id` | 商品詳細取得 | - |
| GET | `/api/categories` | カテゴリ一覧取得 | - |

**クエリパラメータ (GET /api/products)**
- `category`: カテゴリID
- `minPrice`: 最低価格
- `maxPrice`: 最高価格
- `search`: キーワード検索
- `page`: ページ番号
- `limit`: 1ページあたりの件数

### 商品管理 API（管理者専用）

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/admin/products` | 商品一覧取得（全て） | 管理者 |
| POST | `/api/admin/products` | 商品作成 | 管理者 |
| PUT | `/api/admin/products/:id` | 商品更新 | 管理者 |
| DELETE | `/api/admin/products/:id` | 商品削除 | 管理者 |
| POST | `/api/admin/products/:id/image` | 商品画像アップロード | 管理者 |
| POST | `/api/admin/categories` | カテゴリ作成 | 管理者 |

### カート API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/cart` | カート取得 | 必須 |
| POST | `/api/cart/items` | カート商品追加 | 必須 |
| PUT | `/api/cart/items/:id` | カート商品数量変更 | 必須 |
| DELETE | `/api/cart/items/:id` | カート商品削除 | 必須 |
| DELETE | `/api/cart` | カート全削除 | 必須 |

### 注文 API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/orders` | 注文履歴一覧 | 必須 |
| GET | `/api/orders/:id` | 注文詳細 | 必須 |
| POST | `/api/orders` | 注文作成 | 必須 |

## 画像アップロード

### 開発環境
- `backend/uploads/` ディレクトリにローカル保存
- `http://localhost:3001/uploads/products/` または `/uploads/avatars/` でアクセス可能

### 本番環境
- Google Cloud Storageに保存
- 環境変数 `GCS_BUCKET_NAME` と `GCS_SERVICE_ACCOUNT_KEY` が必要

## データベース構造

### users
- id (UUID)
- firebase_uid (VARCHAR)
- email (VARCHAR)
- name (VARCHAR)
- avatar_url (VARCHAR)
- is_admin (BOOLEAN)
- created_at, updated_at

### categories
- id (SERIAL)
- name (VARCHAR)
- description (TEXT)
- created_at

### products
- id (SERIAL)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- stock (INTEGER)
- category_id (INTEGER)
- image_url (VARCHAR)
- is_active (BOOLEAN)
- created_at, updated_at

### addresses
- id (SERIAL)
- user_id (UUID)
- postal_code, prefecture, city, address_line, building, phone_number
- is_default (BOOLEAN)
- created_at, updated_at

### carts
- id (SERIAL)
- user_id (UUID)
- created_at, updated_at

### cart_items
- id (SERIAL)
- cart_id, product_id, quantity
- created_at, updated_at

### orders
- id (SERIAL)
- user_id (UUID)
- address_id (INTEGER)
- total_amount (DECIMAL)
- status (ENUM)
- payment_method (VARCHAR)
- created_at, updated_at

### order_items
- id (SERIAL)
- order_id, product_id, quantity, price
- created_at

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番起動
npm start

# マイグレーション
npm run db:migrate

# シードデータ投入
npm run db:seed
```

## ライセンス

ISC
