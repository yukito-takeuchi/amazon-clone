'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chip } from '@mui/material';
import { ordersApi } from '@/lib/api/orders';
import { Order } from '@/types/order';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';

const statusLabels: Record<Order['status'], string> = {
  pending: '処理待ち',
  confirmed: '確定済み',
  shipped: '発送済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
};

const statusColors: Record<Order['status'], { bgcolor: string; color: string }> = {
  pending: { bgcolor: '#FEF3C7', color: '#92400E' },
  confirmed: { bgcolor: '#DBEAFE', color: '#1E40AF' },
  shipped: { bgcolor: '#E9D5FF', color: '#6B21A8' },
  delivered: { bgcolor: '#DCFCE7', color: '#166534' },
  cancelled: { bgcolor: '#FEE2E2', color: '#991B1B' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to complete before redirecting
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getAll();
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">注文履歴</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">注文履歴がありません</p>
            <Button variant="primary" onClick={() => router.push('/products')}>
              商品を見る
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-sm text-gray-600">注文番号: {order.id}</p>
                  </div>
                  <Chip
                    label={statusLabels[order.status]}
                    sx={{
                      bgcolor: statusColors[order.status].bgcolor,
                      color: statusColors[order.status].color,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  />
                </div>

                <div className="border-t border-b py-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">配送先</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>
                      〒{order.shippingAddress.postalCode} {order.shippingAddress.prefecture}{' '}
                      {order.shippingAddress.city} {order.shippingAddress.addressLine1}
                    </p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">注文内容</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <p className="text-gray-700">
                          {item.productName} × {item.quantity}
                        </p>
                        <p className="font-semibold">¥{(item.productPrice * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    合計: ¥{order.totalAmount.toLocaleString()}
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
