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
  existingImages?: ProductImage[];
  onImagesChange: (images: File[]) => void;
  onImageDelete: (imageId: number) => Promise<void>;
  maxImages?: number;
}

interface ImagePreview {
  id: number | string;
  url: string;
  file?: File;
  isExisting: boolean;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  existingImages = [],
  onImagesChange,
  onImageDelete,
  maxImages = 10,
}) => {
  const [images, setImages] = useState<ImagePreview[]>(() => {
    console.log('MultipleImageUpload - existingImages:', existingImages);
    return existingImages.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      isExisting: true,
    }));
  });

  // Update images when existingImages prop changes
  React.useEffect(() => {
    console.log('MultipleImageUpload - existingImages changed:', existingImages);
    if (existingImages.length > 0) {
      setImages(existingImages.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        isExisting: true,
      })));
    }
  }, [existingImages]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<number | string>>(new Set());
  const [hoveredId, setHoveredId] = useState<number | string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`最大${maxImages}枚まで追加できます。残り${remainingSlots}枚です。`);
      return;
    }

    const newPreviews: ImagePreview[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setImages([...images, ...newPreviews]);
    const updatedFiles = [...newFiles, ...files];
    setNewFiles(updatedFiles);
    onImagesChange(updatedFiles);

    event.target.value = '';
  };

  const handleDelete = async (imagePreview: ImagePreview) => {
    if (imagePreview.isExisting) {
      // 既存画像を削除
      setDeletingIds(new Set(deletingIds).add(imagePreview.id));
      try {
        await onImageDelete(imagePreview.id as number);
        setImages(images.filter((img) => img.id !== imagePreview.id));
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
      setImages(images.filter((img) => img.id !== imagePreview.id));
      const updatedFiles = newFiles.filter((_, index) => {
        const newImageId = `new-${Date.now()}-${index}`;
        return newImageId !== imagePreview.id;
      });
      setNewFiles(updatedFiles);
      onImagesChange(updatedFiles);

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

      <Grid container spacing={2}>
        {images.map((image, index) => (
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
                disabled={deletingIds.has(image.id)}
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
        ))}

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
