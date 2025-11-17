'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api/admin';
import { Product } from '@/types/product';
import { Button } from '@/components/common/Button';
import { useSnackbar } from '@/hooks/useSnackbar';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { FiEdit, FiPlus } from 'react-icons/fi';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && user && !user.isAdmin) {
      showSnackbar('管理者権限が必要です', 'error');
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
      showSnackbar('商品の読み込みに失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(undefined);
  };

  const handleDialogSuccess = () => {
    fetchProducts();
  };

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <SnackbarComponent />
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111827' }}>
            商品管理
          </Typography>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={handleOpenCreateDialog}
          >
            <FiPlus />
            商品を追加
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#6B7280' }}>読み込み中...</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#6B7280', mb: 2 }}>
              商品がまだ登録されていません
            </Typography>
            <Link href="/admin/products/new">
              <Button variant="primary">最初の商品を追加</Button>
            </Link>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F3F4F6' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>画像</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>商品名</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>価格</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>在庫</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>カテゴリ</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>ステータス</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
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
                    <TableRow
                      key={product.id}
                      sx={{
                        '&:hover': { bgcolor: '#F9FAFB' },
                        '&:last-child td, &:last-child th': { border: 0 },
                        opacity: product.isActive ? 1 : 0.5,
                        bgcolor: product.isActive ? 'transparent' : '#FEF2F2',
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            position: 'relative',
                            width: 64,
                            height: 64,
                            bgcolor: '#F3F4F6',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                              sizes="64px"
                              unoptimized
                            />
                          ) : (
                            <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>
                              画像なし
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                          {product.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: '#6B7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 300,
                          }}
                        >
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          ¥{product.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${product.stock}個`}
                          size="small"
                          sx={{
                            bgcolor: product.stock > 0 ? '#DCFCE7' : '#FEE2E2',
                            color: product.stock > 0 ? '#166534' : '#991B1B',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 14, color: '#6B7280' }}>
                          {product.categoryId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.isActive ? '公開中' : '削除済み'}
                          size="small"
                          sx={{
                            bgcolor: product.isActive ? '#DBEAFE' : '#FEE2E2',
                            color: product.isActive ? '#1E40AF' : '#991B1B',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleOpenEditDialog(product)}
                        >
                          <FiEdit />
                          編集
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <ProductDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleDialogSuccess}
        product={selectedProduct}
        mode={dialogMode}
      />
    </Box>
  );
}
