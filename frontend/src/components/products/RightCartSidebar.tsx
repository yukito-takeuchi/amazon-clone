'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Paper, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/common/Button';

export const RightCartSidebar: React.FC = () => {
  const router = useRouter();
  const { cart } = useCartStore();

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 0,
        top: 60,
        width: '5%',
        minWidth: 80,
        height: 'calc(100vh - 60px)',
        bgcolor: '#F3F4F6',
        borderLeft: '1px solid #E5E7EB',
        p: 1,
        zIndex: 100,
      }}
    >
      <Paper
        sx={{
          p: 2,
          textAlign: 'center',
          bgcolor: 'white',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#F9FAFB' },
        }}
        onClick={() => router.push('/cart')}
      >
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
          <ShoppingCartIcon sx={{ fontSize: 32, color: '#FF9900' }} />
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: '#F08804',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {cart.totalItems}
          </Box>
        </Box>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#111827', mb: 0.5 }}>
          カート
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#FF9900' }}>
          ¥{cart.totalPrice.toLocaleString()}
        </Typography>
      </Paper>
    </Box>
  );
};
