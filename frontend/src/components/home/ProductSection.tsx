'use client';

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Product } from '@/types/product';
import { ProductCarousel } from './ProductCarousel';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#0F1111',
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Divider sx={{ mb: 3 }} />
      <ProductCarousel products={products} />
    </Box>
  );
};
