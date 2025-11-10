'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { cartApi } from '@/lib/api/cart';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchQuery(search);
    fetchProducts();
  }, [page, searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const filters = {
        search: searchParams.get('search') || undefined,
        categoryId: searchParams.get('category') || undefined,
        page,
        limit: 12,
      };

      const response = await productsApi.getAll(filters);
      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    router.push(`/products?${params.toString()}`);
    setPage(1);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const updatedCart = await cartApi.addItem({ productId, quantity: 1 });
      setCart(updatedCart);
      alert('カートに追加しました');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert(error.response?.data?.message || 'カートに追加できませんでした');
    }
  };

  const currentSearch = searchParams.get('search');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {currentSearch ? `"${currentSearch}" の検索結果` : '商品一覧'}
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="商品を検索..."
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              検索
            </Button>
          </form>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">商品が見つかりませんでした</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  前へ
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  次へ
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
