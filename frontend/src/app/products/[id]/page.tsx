'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { productsApi } from '@/lib/api/products';
import { cartApi } from '@/lib/api/cart';
import { Product } from '@/types/product';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('商品の読み込みに失敗しました');
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      const updatedCart = await cartApi.addItem({
        productId: product.id,
        quantity,
      });
      setCart(updatedCart);
      alert('カートに追加しました');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert(error.response?.data?.message || 'カートに追加できませんでした');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const imageUrl = product.imageUrl
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.imageUrl}`
    : '/placeholder-product.png';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-[#FF9900] hover:underline mb-6"
        >
          ← 商品一覧に戻る
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative h-96 bg-gray-100 rounded-lg">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ¥{product.price.toLocaleString()}
                </span>
              </div>

              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="text-green-600 font-semibold">
                    在庫あり（残り{product.stock}個）
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold">在庫切れ</div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  商品説明
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      数量
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    isLoading={isAdding}
                    className="w-full"
                  >
                    カートに追加
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
