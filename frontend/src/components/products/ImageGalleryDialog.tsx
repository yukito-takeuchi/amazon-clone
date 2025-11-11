'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ProductImage } from '@/types/product';

interface ImageGalleryDialogProps {
  images: ProductImage[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ImageGalleryDialog: React.FC<ImageGalleryDialogProps> = ({
  images,
  open,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'white',
          maxHeight: '90vh',
        },
      }}
    >
      {/* 閉じるボタン */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          bgcolor: 'white',
          boxShadow: 1,
          zIndex: 1,
          '&:hover': {
            bgcolor: '#F3F4F6',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 4 }}>
        {/* メイン画像エリア */}
        <Box sx={{ position: 'relative', mb: 3 }}>
          {/* 前へボタン */}
          {images.length > 1 && (
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                boxShadow: 2,
                zIndex: 1,
                '&:hover': {
                  bgcolor: '#F3F4F6',
                },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 32 }} />
            </IconButton>
          )}

          {/* メイン画像 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
              maxHeight: 600,
              bgcolor: '#F9FAFB',
              borderRadius: 1,
            }}
          >
            <Box
              component="img"
              src={images[currentIndex].imageUrl}
              alt={`商品画像 ${currentIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: 600,
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* 次へボタン */}
          {images.length > 1 && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                boxShadow: 2,
                zIndex: 1,
                '&:hover': {
                  bgcolor: '#F3F4F6',
                },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 32 }} />
            </IconButton>
          )}
        </Box>

        {/* サムネイル一覧 */}
        {images.length > 1 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#D1D5DB',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: '#F3F4F6',
              },
            }}
          >
            {images.map((image, index) => (
              <Box
                key={image.id}
                onClick={() => handleThumbnailClick(index)}
                sx={{
                  minWidth: 80,
                  height: 80,
                  border: currentIndex === index ? '2px solid #FF9900' : '2px solid #E5E7EB',
                  borderRadius: 1,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: currentIndex === index ? '#FF9900' : '#9CA3AF',
                  },
                }}
              >
                <Box
                  component="img"
                  src={image.imageUrl}
                  alt={`サムネイル ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* 画像番号表示 */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 2,
            color: '#6B7280',
            fontSize: 14,
          }}
        >
          {currentIndex + 1} / {images.length}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
