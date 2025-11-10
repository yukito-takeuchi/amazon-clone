'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Select,
  MenuItem,
  FormControl,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { FiTrash2 } from 'react-icons/fi';
import { cartApi } from '@/lib/api/cart';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSnackbar } from '@/hooks/useSnackbar';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await cartApi.updateItem(itemId, { quantity });
      setCart(updatedCart);
      showSnackbar('数量を更新しました', 'success');
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      showSnackbar(error.response?.data?.message || '数量の更新に失敗しました', 'error');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('この商品をカートから削除しますか？')) return;

    try {
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
      showSnackbar('商品を削除しました', 'success');
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      showSnackbar(error.response?.data?.message || '商品の削除に失敗しました', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111827', mb: 4 }}>
            ショッピングカート
          </Typography>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: '#6B7280', mb: 2 }}>
                カートは空です
              </Typography>
              <Button variant="primary" onClick={() => router.push('/products')}>
                商品を見る
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <SnackbarComponent />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111827', mb: 4 }}>
          ショッピングカート
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
          {/* Cart Items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cart.items.map((item) => {
              // Handle imageUrl - it might be null or a full URL
              let imageUrl = null;
              if (item.product?.imageUrl) {
                if (item.product.imageUrl.startsWith('http')) {
                  // Full URL (GCS)
                  imageUrl = item.product.imageUrl;
                } else {
                  // Relative path (local development)
                  imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:3001'}/${item.product.imageUrl}`;
                }
              }

              return (
                <Card key={item.id}>
                  <CardContent sx={{ display: 'flex', gap: 2, p: 2 }}>
                    {/* Product Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: 96,
                        height: 96,
                        bgcolor: '#F3F4F6',
                        borderRadius: 1,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.product?.name || '商品画像'}
                          fill
                          className="object-contain p-2"
                          sizes="96px"
                          unoptimized
                        />
                      ) : (
                        <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>
                          画像なし
                        </Typography>
                      )}
                    </Box>

                    {/* Product Info */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: '#111827',
                          mb: 0.5,
                          cursor: 'pointer',
                          '&:hover': { color: '#FF9900' },
                        }}
                        onClick={() => router.push(`/products/${item.product?.id}`)}
                      >
                        {item.product?.name || '商品名不明'}
                      </Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>
                        ¥{(item.product?.price || 0).toLocaleString()}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
                            数量:
                          </Typography>
                          <FormControl size="small">
                            <Select
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              sx={{
                                minWidth: 70,
                                bgcolor: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#D1D5DB',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#9CA3AF',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#FF9900',
                                },
                              }}
                            >
                              {Array.from(
                                { length: Math.min(item.product?.stock || 10, 10) },
                                (_, i) => i + 1
                              ).map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        <Box
                          component="button"
                          onClick={() => handleRemoveItem(item.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: '#DC2626',
                            bgcolor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            '&:hover': { color: '#B91C1C' },
                          }}
                        >
                          <FiTrash2 />
                          <Typography sx={{ fontSize: 14 }}>削除</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Subtotal */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                        ¥{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <Box sx={{ gridColumn: { xs: '1', lg: 'span 1' } }}>
            <Card sx={{ position: 'sticky', top: 16 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827', mb: 2 }}>
                  注文内容
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                    <Typography>商品数</Typography>
                    <Typography>{cart.totalItems}点</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                    <Typography>小計</Typography>
                    <Typography>¥{cart.totalPrice.toLocaleString()}</Typography>
                  </Box>
                </Box>

                <Box sx={{ borderTop: 1, borderColor: '#E5E7EB', pt: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
                      合計
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
                      ¥{cart.totalPrice.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/checkout')}
                >
                  レジに進む
                </Button>
              </CardContent>
            </Card>
          </Box>
        </div>
      </div>
    </div>
  );
}
