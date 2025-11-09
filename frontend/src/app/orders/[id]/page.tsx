'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { Order } from '@/types/order';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { FiCheckCircle } from 'react-icons/fi';

const statusLabels: Record<Order['status'], string> = {
  pending: '処理待ち',
  processing: '処理中',
  shipped: '発送済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
};

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [isAuthenticated, params.id]);

  const fetchOrder = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      alert('注文の読み込みに失敗しました');
      router.push('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-center gap-4">
            <FiCheckCircle className="text-green-600 text-3xl flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-green-900 mb-1">
                ご注文ありがとうございます！
              </h2>
              <p className="text-green-700">
                注文が正常に完了しました。注文番号: {order.id}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">注文詳細</h1>
          <Button variant="outline" onClick={() => router.push('/orders')}>
            注文履歴に戻る
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">注文情報</h2>
                  <p className="text-sm text-gray-600">
                    注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">注文番号: {order.id}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded font-semibold ${
                    statusColors[order.status]
                  }`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">配送先</h2>
              <div className="text-gray-700">
                <p className="font-semibold mb-2">{order.shippingAddress.fullName}</p>
                <p>
                  〒{order.shippingAddress.postalCode}
                </p>
                <p>
                  {order.shippingAddress.prefecture} {order.shippingAddress.city}{' '}
                  {order.shippingAddress.addressLine1}
                </p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p className="mt-2">電話: {order.shippingAddress.phoneNumber}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">注文商品</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start pb-4 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        単価: ¥{item.productPrice.toLocaleString()} × {item.quantity}個
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ¥{item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">注文概要</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>商品合計</span>
                  <span>¥{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>配送料</span>
                  <span>無料</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>合計</span>
                  <span>¥{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push('/products')}
                >
                  買い物を続ける
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/orders')}
                >
                  注文履歴を見る
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
