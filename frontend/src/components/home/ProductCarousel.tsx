'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Product } from '@/types/product';

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });
    }
  };

  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">商品がありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Left Arrow */}
      <IconButton
        onClick={() => scroll('left')}
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'white',
          boxShadow: 2,
          '&:hover': { bgcolor: 'grey.100' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* Scrollable Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'grey.100',
            borderRadius: 1,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'grey.500',
            },
          },
        }}
      >
        {products.map((product) => {
          const imageUrl = product.imageUrl?.startsWith('http')
            ? product.imageUrl
            : product.imageUrl
            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.imageUrl}`
            : null;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                sx={{
                  minWidth: 200,
                  width: 200,
                  height: 320,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    bgcolor: 'grey.50',
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
                      style={{ objectFit: 'contain', padding: '8px' }}
                      sizes="200px"
                      unoptimized
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No Image
                    </Typography>
                  )}
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 40,
                      color: 'text.primary',
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#B12704',
                    }}
                  >
                    ¥{product.price.toLocaleString()}
                  </Typography>
                  {product.stock > 0 ? (
                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                      在庫あり
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                      在庫切れ
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </Box>

      {/* Right Arrow */}
      <IconButton
        onClick={() => scroll('right')}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'white',
          boxShadow: 2,
          '&:hover': { bgcolor: 'grey.100' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};
