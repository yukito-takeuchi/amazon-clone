'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cartApi } from '@/lib/api/cart';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { FiTrash2 } from 'react-icons/fi';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await cartApi.updateItem(productId, { quantity });
      setCart(updatedCart);
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      alert(error.response?.data?.message || '数量の更新に失敗しました');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!confirm('この商品をカートから削除しますか？')) return;

    try {
      const updatedCart = await cartApi.removeItem(productId);
      setCart(updatedCart);
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      alert(error.response?.data?.message || '商品の削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">ショッピングカート</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">カートは空です</p>
            <Button variant="primary" onClick={() => router.push('/products')}>
              商品を見る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ショッピングカート
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const imageUrl = item.product.imageUrl
                ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.imageUrl}`
                : '/placeholder-product.png';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 flex gap-4"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#FF9900]"
                      onClick={() => router.push(`/products/${item.product.id}`)}
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      ¥{item.product.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">数量:</label>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.product.id,
                              Number(e.target.value)
                            )
                          }
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          {Array.from(
                            { length: Math.min(item.product.stock, 10) },
                            (_, i) => i + 1
                          ).map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <FiTrash2 />
                        <span className="text-sm">削除</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ¥{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                注文内容
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>商品数</span>
                  <span>{cart.totalItems}点</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>小計</span>
                  <span>¥{cart.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>合計</span>
                  <span>¥{cart.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push('/checkout')}
              >
                レジに進む
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
