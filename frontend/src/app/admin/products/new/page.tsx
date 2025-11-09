'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && user && !user.isAdmin) {
      alert('管理者権限が必要です');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-[#FF9900] hover:underline mb-6"
        >
          ← 商品一覧に戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">商品の追加</h1>

        <ProductForm mode="create" />
      </div>
    </div>
  );
}
