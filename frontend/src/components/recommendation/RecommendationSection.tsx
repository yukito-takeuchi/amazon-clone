'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Typography, IconButton, Skeleton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { ProductRecommendation } from '@/lib/api/recommendation';

interface RecommendationSectionProps {
  title: string;
  products: ProductRecommendation[];
  loading?: boolean;
  error?: string | null;
}

const ProductCard: React.FC<{ product: ProductRecommendation }> = ({ product }) => {
  let imageUrl = null;
  if (product.imageUrl) {
    if (product.imageUrl.startsWith('http')) {
      imageUrl = product.imageUrl;
    } else {
      imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrl}`;
    }
  }

  return (
    <Link href={`/products/${product.id}`} className="block flex-shrink-0 w-48">
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 1,
          overflow: 'hidden',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: 3 },
          height: '100%',
        }}
      >
        <Box sx={{ position: 'relative', height: 160, bgcolor: '#f5f5f5' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="192px"
              unoptimized
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary" fontSize={12}>画像なし</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Typography
            fontSize={13}
            fontWeight={500}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: 40,
              color: '#0066c0',
              '&:hover': { color: '#c45500', textDecoration: 'underline' },
            }}
          >
            {product.name}
          </Typography>
          <Typography fontWeight={700} fontSize={16} sx={{ mt: 0.5 }}>
            ¥{product.price.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

const SkeletonCard: React.FC = () => (
  <Box sx={{ width: 192, flexShrink: 0 }}>
    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
    <Skeleton width="80%" sx={{ mt: 1 }} />
    <Skeleton width="40%" />
  </Box>
);

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  products,
  loading = false,
  error = null,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (error) return null;
  if (!loading && products.length === 0) return null;

  return (
    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute',
            left: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: 'white',
            boxShadow: 2,
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            px: 1,
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)
          }
        </Box>

        <IconButton
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute',
            right: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: 'white',
            boxShadow: 2,
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
};
