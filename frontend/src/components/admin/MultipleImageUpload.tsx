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
    console.log('MultipleImageUpload - existingImages changed:', existingImages);
    console.log('MultipleImageUpload - newImages:', newImages);

    const existingPreviews: ImagePreview[] = existingImages.map((img) => {
      // img.imageUrl is already a full URL from the backend
      let imageUrl = img.imageUrl;

      // Only add base URL if it's a relative path
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageUrl}`;
      }

      console.log('Image URL:', imageUrl);

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

    const combinedImages = [...existingPreviews, ...newPreviews];
    console.log('MultipleImageUpload - combinedImages:', combinedImages);
    setImages(combinedImages);
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

  console.log('MultipleImageUpload - Rendering with images:', images);
  console.log('MultipleImageUpload - images.length:', images.length);

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: '#111827', mb: 2 }}
      >
        商品画像 ({images.length}/{maxImages})
      </Typography>

      <Grid container spacing={2}>
        {images.map((image, index) => {
          console.log(`Rendering Image ${index + 1}:`, image);
          return (
          <Grid item xs={6} sm={4} md={3} key={image.id}>
            <Card
              sx={{
                position: 'relative',
                paddingTop: '100%',
                overflow: 'visible',
                '&:hover .delete-button': {
                  opacity: 1,
                },
              }}
              onMouseEnter={() => setHoveredId(image.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <CardMedia
                component="img"
                image={image.url}
                alt={`画像 ${index + 1}`}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* 表示順序 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 600,
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
                  top: -8,
                  right: -8,
                  bgcolor: 'error.main',
                  color: 'white',
                  opacity: hoveredId === image.id ? 1 : 0,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                  width: 32,
                  height: 32,
                }}
              >
                {deletingIds.has(image.id) ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <CloseIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>

              {/* 新規画像バッジ */}
              {!image.isExisting && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: '#FF9900',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  新規
                </Box>
              )}
            </Card>
          </Grid>
          );
        })}

        {/* 画像追加ボタン */}
        {remainingSlots > 0 && (
          <Grid item xs={6} sm={4} md={3}>
            <Button
              component="label"
              sx={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                border: '2px dashed #D1D5DB',
                borderRadius: 1,
                bgcolor: '#F9FAFB',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#F3F4F6',
                  borderColor: '#FF9900',
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
                  sx={{ fontSize: 48, color: '#9CA3AF', mb: 1 }}
                />
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  画像を追加
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.5 }}>
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
