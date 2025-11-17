'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { stripeApi } from '@/lib/api/stripe';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCart } = useCartStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      // Wait for auth to complete
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setError('認証されていません。ログインしてください。');
        setLoading(false);
        return;
      }

      if (!sessionId) {
        setError('セッションIDが見つかりません');
        setLoading(false);
        return;
      }

      try {
        // Confirm payment and create order
        const result = await stripeApi.confirmPayment({ sessionId });
        setOrderId(result.order.id);

        // Clear cart on success
        setCart(null);
        setLoading(false);
      } catch (err: any) {
        console.error('Payment confirmation error:', err);
        setError(err.response?.data?.error || '注文の作成に失敗しました');
        setLoading(false);
      }
    };

    confirmPayment();
  }, [sessionId, setCart, isAuthenticated, authLoading]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              注文を処理中です...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              お待ちください
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <ErrorIcon sx={{ fontSize: 80, color: '#EF4444', mb: 3 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              エラーが発生しました
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {error}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => router.push('/cart')}>
                カートに戻る
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

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

          {orderId && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              注文番号: #{orderId}
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
