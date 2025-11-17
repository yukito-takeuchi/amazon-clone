'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { productsApi } from '@/lib/api/products';
import { Product } from '@/types/product';
import { ProductSection } from '@/components/home/ProductSection';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productsApi.getAll({ limit: 20 });
      setAllProducts(response.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 商品をランダムにシャッフル
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 各セクション用の商品を準備
  const recommendedProducts = shuffleArray(allProducts).slice(0, 8);
  const todaysDeals = [...allProducts]
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);
  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const popularProducts = shuffleArray(allProducts).slice(0, 8);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">
            読み込み中...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#EAEDED', minHeight: 'calc(100vh - 60px)' }}>
      {/* Hero Banner */}
      <Paper
        sx={{
          background: 'linear-gradient(to bottom, #37475A, #EAEDED)',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: -10,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', color: 'white', py: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Amazon Clone へようこそ
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              お買い得商品をお探しください
            </Typography>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 1, boxShadow: 1 }}>
          {/* Notice */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              ※ レコメンド機能は開発中です。現在は商品をランダムに表示しています。
            </Typography>
          </Alert>

          {/* 閲覧履歴に基づくおすすめ */}
          <ProductSection
            title="閲覧履歴に基づくおすすめ商品"
            subtitle="あなたへのおすすめ"
            products={recommendedProducts}
          />

          {/* 今日のお得商品 */}
          <ProductSection
            title="今日のお得商品"
            subtitle="お買い得価格でご提供"
            products={todaysDeals}
          />

          {/* 新着商品 */}
          <ProductSection
            title="新着商品"
            subtitle="最新の商品をチェック"
            products={newArrivals}
          />

          {/* 人気商品 */}
          <ProductSection
            title="人気商品"
            subtitle="多くのお客様に選ばれています"
            products={popularProducts}
          />

          {/* セール情報 */}
          <Box sx={{ mt: 6, p: 4, bgcolor: '#FEF3C7', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#92400E' }}>
              セール・キャンペーン情報
            </Typography>
            <Typography variant="body1" color="text.secondary">
              お得なセール情報は近日公開予定です。お楽しみに！
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
