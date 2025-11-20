import React from 'react';
import { StarRating } from './StarRating';
import Link from 'next/link';

interface ReviewSummaryProps {
  averageRating: number;
  totalCount: number;
  onScrollToReviews?: () => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalCount,
  onScrollToReviews,
}) => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={onScrollToReviews}
        className="flex items-center gap-1 hover:text-[#C7511F] transition-colors"
      >
        <StarRating value={averageRating} size="small" />
        <span className="text-[#007185] hover:text-[#C7511F] hover:underline">
          {totalCount > 0 ? `${totalCount}件のレビュー` : 'レビューはまだありません'}
        </span>
      </button>

      {totalCount === 0 && (
        <>
          <span className="text-gray-400">|</span>
          <button
            onClick={onScrollToReviews}
            className="text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            最初のレビューを書く
          </button>
        </>
      )}
    </div>
  );
};
