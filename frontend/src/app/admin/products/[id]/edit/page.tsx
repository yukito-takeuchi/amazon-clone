'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api/admin';
import { Product } from '@/types/product';
import { ProductForm } from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && user && !user.isAdmin) {
      alert('管理者権限が必要です');
      router.push('/');
    } else if (user?.isAdmin && params.id) {
      fetchProduct(params.id as string);
    }
  }, [isAuthenticated, authLoading, user, params.id, router]);

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProduct(id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('商品の読み込みに失敗しました');
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!product) {
    return null;
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">商品の編集</h1>

        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
