'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { ProductImage } from '@/types/product';

interface MultipleImageUploadProps {
  productId?: string;
  existingImages?: ProductImage[];
  newImages: File[];
  onNewImagesChange: (images: File[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

interface ImagePreview {
  id: number | string;
  url: string;
  file?: File;
  isExisting: boolean;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  productId,
  existingImages = [],
  newImages,
  onNewImagesChange,
  disabled = false,
  maxImages = 10,
}) => {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<number | string>>(new Set());
  const [hoveredId, setHoveredId] = useState<number | string | null>(null);

  // Update images when existingImages or newImages prop changes
  React.useEffect(() => {
    const existingPreviews: ImagePreview[] = existingImages.map((img) => {
      // img.imageUrl is already a full URL from the backend
      let imageUrl = img.imageUrl;

      // Only add base URL if it's a relative path
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageUrl}`;
      }

      return {
        id: img.id,
        url: imageUrl,
        isExisting: true,
      };
    });

    const newPreviews: ImagePreview[] = newImages.map((file, index) => ({
      id: `new-${index}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setImages([...existingPreviews, ...newPreviews]);
  }, [existingImages, newImages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = Array.from(event.target.files || []);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`最大${maxImages}枚まで追加できます。残り${remainingSlots}枚です。`);
      return;
    }

    const updatedFiles = [...newImages, ...files];
    onNewImagesChange(updatedFiles);

    event.target.value = '';
  };

  const handleDelete = async (imagePreview: ImagePreview) => {
    if (disabled) return;

    if (imagePreview.isExisting) {
      // 既存画像を削除
      if (!productId) {
        alert('商品IDが見つかりません');
        return;
      }

      setDeletingIds(new Set(deletingIds).add(imagePreview.id));
      try {
        const { adminApi } = await import('@/lib/api/admin');
        await adminApi.deleteProductImage(productId, imagePreview.id as number);
        // 成功したらリロードが必要（親コンポーネントで対応）
      } catch (error) {
        console.error('Failed to delete image:', error);
        alert('画像の削除に失敗しました');
      } finally {
        const newDeletingIds = new Set(deletingIds);
        newDeletingIds.delete(imagePreview.id);
        setDeletingIds(newDeletingIds);
      }
    } else {
      // 新規画像を削除
      const imageIndex = parseInt(imagePreview.id.toString().split('-')[1]);
      const updatedFiles = newImages.filter((_, index) => index !== imageIndex);
      onNewImagesChange(updatedFiles);

      // ObjectURLを解放
      URL.revokeObjectURL(imagePreview.url);
    }
  };

  const remainingSlots = maxImages - images.length;

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: '#111827', mb: 2 }}
      >
        商品画像 ({images.length}/{maxImages})
      </Typography>

      <Grid container spacing={3}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
            <Card
              sx={{
                position: 'relative',
                width: '100%',
                minWidth: '250px',
                height: '300px',
                overflow: 'visible',
                boxShadow: 2,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 4,
                },
                '&:hover .delete-button': {
                  opacity: 1,
                },
              }}
              onMouseEnter={() => setHoveredId(image.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Box
                component="img"
                src={image.url}
                alt={`画像 ${index + 1}`}
                onError={(e) => {
                  console.error('Image load error:', image.url);
                  console.error('Error event:', e);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', image.url);
                }}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#f0f0f0',
                }}
              />

              {/* 表示順序 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  fontSize: 14,
                  fontWeight: 700,
                  minWidth: 32,
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </Box>

              {/* 削除ボタン */}
              <IconButton
                className="delete-button"
                onClick={() => handleDelete(image)}
                disabled={disabled || deletingIds.has(image.id)}
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  bgcolor: 'error.main',
                  color: 'white',
                  opacity: hoveredId === image.id ? 1 : 0,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'error.dark',
                    transform: 'scale(1.1)',
                  },
                  width: 40,
                  height: 40,
                  boxShadow: 3,
                }}
              >
                {deletingIds.has(image.id) ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  <CloseIcon sx={{ fontSize: 22 }} />
                )}
              </IconButton>

              {/* 新規画像バッジ */}
              {!image.isExisting && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    bgcolor: '#FF9900',
                    color: 'white',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1.5,
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: 2,
                  }}
                >
                  新規
                </Box>
              )}
            </Card>
          </Grid>
        ))}

        {/* 画像追加ボタン */}
        {remainingSlots > 0 && (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Button
              component="label"
              sx={{
                width: '100%',
                minWidth: '250px',
                height: '300px',
                position: 'relative',
                border: '3px dashed #D1D5DB',
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: '#F3F4F6',
                  borderColor: '#FF9900',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <AddPhotoAlternateIcon
                  sx={{ fontSize: 64, color: '#9CA3AF', mb: 2 }}
                />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>
                  画像を追加
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 1 }}>
                  残り {remainingSlots} 枚
                </Typography>
              </Box>
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                disabled={disabled}
                onChange={handleFileSelect}
              />
            </Button>
          </Grid>
        )}
      </Grid>

      {images.length === 0 && (
        <Typography sx={{ fontSize: 14, color: '#6B7280', mt: 2 }}>
          ※ 商品画像を追加してください（最大{maxImages}枚）
        </Typography>
      )}
    </Box>
  );
};
