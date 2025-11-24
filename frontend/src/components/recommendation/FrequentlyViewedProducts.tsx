'use client';

import React, { useEffect, useState } from 'react';
import { RecommendationSection } from './RecommendationSection';
import { recommendationApi, ProductRecommendation } from '@/lib/api/recommendation';

export const FrequentlyViewedProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrequentlyViewed = async () => {
      try {
        setLoading(true);
        const response = await recommendationApi.getFrequentlyViewed(10, 30);
        setProducts(response.recommendations);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching frequently viewed products:', err);
        // 401エラーの場合は非表示にする（未ログイン）
        if (err.response?.status === 401) {
          setError('unauthorized');
        } else {
          setError('Failed to load frequently viewed products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFrequentlyViewed();
  }, []);

  return (
    <RecommendationSection
      title="最近よく見ている商品"
      products={products}
      loading={loading}
      error={error}
    />
  );
};
