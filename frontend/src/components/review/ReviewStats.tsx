import React from 'react';
import { LinearProgress, Box } from '@mui/material';
import { StarRating } from './StarRating';
import { Review } from '@/types/review';

interface ReviewStatsProps {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({
  reviews,
  averageRating,
  totalCount,
}) => {
  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]

  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  const ratingPercentages = ratingCounts.map((count) =>
    totalCount > 0 ? (count / totalCount) * 100 : 0
  );

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">カスタマーレビュー</h3>

      {/* Average Rating */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <StarRating value={averageRating} showValue size="medium" />
        </div>
        <p className="text-sm text-gray-600">
          {totalCount}件のグローバル評価
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const index = star - 1;
          const count = ratingCounts[index];
          const percentage = ratingPercentages[index];

          return (
            <div key={star} className="flex items-center gap-3">
              <button className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline whitespace-nowrap">
                星{star}つ
              </button>
              <Box sx={{ flexGrow: 1, mx: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 20,
                    borderRadius: 1,
                    backgroundColor: '#F0F2F2',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#FFA41C',
                    },
                  }}
                />
              </Box>
              <span className="text-sm text-gray-600 w-12 text-right">
                {Math.round(percentage)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Review Count Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          総レビュー数: {totalCount}件
        </p>
      </div>
    </div>
  );
};
