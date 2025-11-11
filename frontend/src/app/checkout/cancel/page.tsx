'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { Button } from '@/components/common/Button';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card sx={{ textAlign: 'center' }}>
        <CardContent sx={{ py: 6 }}>
          <CancelIcon
            sx={{ fontSize: 80, color: '#EF4444', mb: 3 }}
          />

          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            お支払いがキャンセルされました
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            決済が完了しませんでした。カート内の商品は保持されています。
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="primary"
              onClick={() => router.push('/checkout')}
            >
              再度お支払いへ進む
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/cart')}
            >
              カートに戻る
            </Button>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            ご不明な点がございましたら、カスタマーサポートまでお問い合わせください。
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
