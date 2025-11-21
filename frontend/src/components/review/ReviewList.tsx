import React, { useState } from 'react';
import { Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';
import { Review } from '@/types/review';
import { ReviewItem } from './ReviewItem';

interface ReviewListProps {
  reviews: Review[];
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
}

type SortOption = 'newest' | 'highest' | 'lowest';

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onEdit,
  onDelete,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">まだレビューがありません</p>
        <p className="text-sm text-gray-500 mt-2">
          最初のレビューを投稿してみませんか？
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">
          {reviews.length}件のカスタマーレビュー
        </h3>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            displayEmpty
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D5D9D9',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#888',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E77600',
              },
            }}
          >
            <MenuItem value="newest">新着順</MenuItem>
            <MenuItem value="highest">評価が高い順</MenuItem>
            <MenuItem value="lowest">評価が低い順</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Review Items */}
      <div>
        {sortedReviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
