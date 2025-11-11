'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCart } = useCartStore();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart on success
    setCart(null);
  }, [setCart]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card sx={{ textAlign: 'center' }}>
        <CardContent sx={{ py: 6 }}>
          <CheckCircleIcon
            sx={{ fontSize: 80, color: '#10B981', mb: 3 }}
          />

          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            ご注文ありがとうございました！
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            お支払いが正常に完了しました。
          </Typography>

          {sessionId && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              注文ID: {sessionId}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="primary"
              onClick={() => router.push('/orders')}
            >
              注文履歴を見る
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
            >
              買い物を続ける
            </Button>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            ご登録のメールアドレスに注文確認メールを送信しました。
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>読み込み中...</Typography>
      </Container>
    }>
      <SuccessContent />
    </Suspense>
  );
}
