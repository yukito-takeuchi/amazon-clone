'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Select, MenuItem, FormControl, InputLabel, Chip, Box, Grid } from '@mui/material';
import { productsApi } from '@/lib/api/products';
import { cartApi } from '@/lib/api/cart';
import { Product, ProductImage } from '@/types/product';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSnackbar } from '@/hooks/useSnackbar';
import { ImageGalleryDialog } from '@/components/products/ImageGalleryDialog';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      showSnackbar('商品の読み込みに失敗しました', 'error');
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      const updatedCart = await cartApi.addItem({
        productId: product.id,
        quantity,
      });
      setCart(updatedCart);
      showSnackbar('カートに追加しました', 'success');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      showSnackbar(error.response?.data?.message || 'カートに追加できませんでした', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Get all product images (including the main imageUrl if exists)
  const productImages: ProductImage[] = React.useMemo(() => {
    if (!product) return [];

    if (product.images && product.images.length > 0) {
      console.log('Product images found:', product.images);
      return [...product.images];
    }

    // Fallback: If there's a main imageUrl but no images array, create one from imageUrl
    if (product.imageUrl) {
      const mainImageUrl = product.imageUrl.startsWith('http')
        ? product.imageUrl
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.imageUrl}`;

      return [{
        id: 0,
        imageUrl: mainImageUrl,
        displayOrder: 1,
      }];
    }

    return [];
  }, [product, product?.images, product?.imageUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SnackbarComponent />
      <ImageGalleryDialog
        images={productImages}
        open={dialogOpen}
        onClose={handleDialogClose}
        initialIndex={selectedImageIndex}
      />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-[#FF9900] hover:underline mb-6"
        >
          ← 商品一覧に戻る
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              {/* メイン画像 */}
              {productImages.length > 0 ? (
                <Box
                  onClick={() => handleImageClick(0)}
                  sx={{
                    position: 'relative',
                    height: 400,
                    bgcolor: '#F9FAFB',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    mb: 2,
                    '&:hover': {
                      bgcolor: '#F3F4F6',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={productImages[0].imageUrl}
                    alt={product.name}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      p: 4,
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    position: 'relative',
                    height: 400,
                    bgcolor: '#F9FAFB',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <span className="text-gray-400 text-lg">画像なし</span>
                </Box>
              )}

              {/* サムネイル一覧 */}
              {productImages.length > 1 && (
                <Grid container spacing={2}>
                  {productImages.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Box
                        onClick={() => handleImageClick(index)}
                        sx={{
                          position: 'relative',
                          paddingTop: '100%',
                          border: '2px solid #E5E7EB',
                          borderRadius: 1,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#FF9900',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={image.imageUrl}
                          alt={`サムネイル ${index + 1}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ¥{product.price.toLocaleString()}
                </span>
              </div>

              <div className="mb-6">
                {product.stock > 0 ? (
                  <Chip
                    label={`在庫あり（残り${product.stock}個）`}
                    sx={{
                      bgcolor: '#DCFCE7',
                      color: '#166534',
                      fontWeight: 600,
                      fontSize: 14,
                      height: 32,
                    }}
                  />
                ) : (
                  <Chip
                    label="在庫切れ"
                    sx={{
                      bgcolor: '#FEE2E2',
                      color: '#991B1B',
                      fontWeight: 600,
                      fontSize: 14,
                      height: 32,
                    }}
                  />
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  商品説明
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="space-y-4">
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="quantity-label">数量</InputLabel>
                    <Select
                      labelId="quantity-label"
                      label="数量"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      sx={{
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
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(
                        (num) => (
                          <MenuItem key={num} value={num}>
                            {num}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    isLoading={isAdding}
                    className="w-full"
                  >
                    カートに追加
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
