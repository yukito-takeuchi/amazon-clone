'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api/admin';
import { Product } from '@/types/product';
import { Button } from '@/components/common/Button';
import { FiEdit, FiPlus } from 'react-icons/fi';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && user && !user.isAdmin) {
      alert('管理者権限が必要です');
      router.push('/');
    } else if (user?.isAdmin) {
      fetchProducts();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('商品の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
          <Link href="/admin/products/new">
            <Button variant="primary" className="flex items-center gap-2">
              <FiPlus />
              商品を追加
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">商品がまだ登録されていません</p>
            <Link href="/admin/products/new">
              <Button variant="primary">最初の商品を追加</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left py-3 px-4">画像</th>
                  <th className="text-left py-3 px-4">商品名</th>
                  <th className="text-left py-3 px-4">価格</th>
                  <th className="text-left py-3 px-4">在庫</th>
                  <th className="text-left py-3 px-4">カテゴリ</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  // Handle imageUrl - backend returns full URL
                  let imageUrl = null;
                  if (product.imageUrl) {
                    if (product.imageUrl.startsWith('http')) {
                      imageUrl = product.imageUrl;
                    } else {
                      imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.imageUrl}`;
                    }
                  }

                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="relative w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                              sizes="64px"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">画像なし</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {product.description}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold">¥{product.price.toLocaleString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock}個
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {product.categoryId}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <FiEdit />
                            編集
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
