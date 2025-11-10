'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Chip } from '@mui/material';
import { Product } from '@/types/product';
import { Button } from '@/components/common/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <span className="text-gray-400">画像なし</span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#FF9900] line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ¥{product.price.toLocaleString()}
          </span>
          {product.stock > 0 ? (
            <Chip
              label="在庫あり"
              size="small"
              sx={{
                bgcolor: '#DCFCE7',
                color: '#166534',
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          ) : (
            <Chip
              label="在庫切れ"
              size="small"
              sx={{
                bgcolor: '#FEE2E2',
                color: '#991B1B',
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          )}
        </div>

        {onAddToCart && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0}
            className="w-full"
          >
            カートに追加
          </Button>
        )}
      </div>
    </div>
  );
};
