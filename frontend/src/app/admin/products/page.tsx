'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api/admin';
import { Product } from '@/types/product';
import { Button } from '@/components/common/Button';
import { useSnackbar } from '@/hooks/useSnackbar';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { FiEdit, FiPlus } from 'react-icons/fi';

const ITEMS_PER_PAGE = 20;

interface Filters {
  categoryId: string;
  status: string;
  stockStatus: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<Filters>({
    categoryId: 'all',
    status: 'all',
    stockStatus: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && user && !user.isAdmin) {
      showSnackbar('管理者権限が必要です', 'error');
      router.push('/');
    } else if (user?.isAdmin) {
      fetchCategories();
      fetchProducts(1, true);
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Refetch when filters change
  useEffect(() => {
    if (user?.isAdmin) {
      fetchProducts(1, true);
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const { products: newProducts, hasMore: more } = await adminApi.getAllProducts(pageNum, ITEMS_PER_PAGE);
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showSnackbar('商品の読み込みに失敗しました', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Apply filters and sorting to products
  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...products];

    // Filter by category
    if (filters.categoryId !== 'all') {
      result = result.filter(p => p.categoryId.toString() === filters.categoryId);
    }

    // Filter by status
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter(p => p.isActive === isActive);
    }

    // Filter by stock status
    if (filters.stockStatus !== 'all') {
      const hasStock = filters.stockStatus === 'in_stock';
      result = result.filter(p => hasStock ? p.stock > 0 : p.stock === 0);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (filters.sortBy) {
        case 'created_at':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'stock':
          aVal = a.stock;
          bVal = b.stock;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [products, filters]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchProducts(page + 1, false);
    }
  }, [isLoadingMore, hasMore, page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoadingMore, isLoading]);

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
    fetchProducts(1, true);
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
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

        {/* Filters and Sorting */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  value={filters.categoryId}
                  label="カテゴリ"
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                >
                  <MenuItem value="all">全て</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={filters.status}
                  label="ステータス"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="all">全て</MenuItem>
                  <MenuItem value="active">公開中</MenuItem>
                  <MenuItem value="inactive">削除済み</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>在庫状態</InputLabel>
                <Select
                  value={filters.stockStatus}
                  label="在庫状態"
                  onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                >
                  <MenuItem value="all">全て</MenuItem>
                  <MenuItem value="in_stock">在庫あり</MenuItem>
                  <MenuItem value="out_of_stock">在庫切れ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>並び順</InputLabel>
                <Select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  label="並び順"
                  displayEmpty
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                  }}
                >
                  <MenuItem value="created_at_desc">追加日: 新しい順</MenuItem>
                  <MenuItem value="created_at_asc">追加日: 古い順</MenuItem>
                  <MenuItem value="price_desc">価格: 高い順</MenuItem>
                  <MenuItem value="price_asc">価格: 安い順</MenuItem>
                  <MenuItem value="stock_desc">在庫: 多い順</MenuItem>
                  <MenuItem value="stock_asc">在庫: 少ない順</MenuItem>
                  <MenuItem value="name_asc">商品名: A-Z</MenuItem>
                  <MenuItem value="name_desc">商品名: Z-A</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="商品名・説明で検索"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#6B7280' }}>読み込み中...</Typography>
          </Box>
        ) : filteredAndSortedProducts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#6B7280', mb: 2 }}>
              {products.length === 0 ? '商品がまだ登録されていません' : '該当する商品が見つかりませんでした'}
            </Typography>
            {products.length === 0 && (
              <Link href="/admin/products/new">
                <Button variant="primary">最初の商品を追加</Button>
              </Link>
            )}
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
                {filteredAndSortedProducts.map((product) => {
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

      {/* Load more trigger */}
      <div ref={loadMoreRef} style={{ height: 20 }} />
      {isLoadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      {!hasMore && products.length > 0 && (
        <Typography sx={{ textAlign: 'center', py: 2, color: '#6B7280' }}>
          全ての商品を表示しました
        </Typography>
      )}
    </Box>
  );
}
