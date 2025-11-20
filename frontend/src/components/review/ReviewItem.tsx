import React, { useState } from 'react';
import Image from 'next/image';
import { Review } from '@/types/review';
import { StarRating } from './StarRating';
import { useAuthStore } from '@/store/authStore';
import { Dialog, DialogContent } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface ReviewItemProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isOwnReview = user?.id === review.user.id;
  const reviewDate = new Date(review.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <div className="border-b border-gray-200 py-6">
        {/* User Info */}
        <div className="flex items-start gap-3 mb-3">
          {review.user.avatarUrl ? (
            <Image
              src={review.user.avatarUrl}
              alt={review.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <AccountCircleIcon sx={{ fontSize: 40, color: '#666' }} />
          )}
          <div className="flex-1">
            <div className="font-medium text-sm">{review.user.name}</div>
          </div>
        </div>

        {/* Rating and Date */}
        <div className="flex items-center gap-3 mb-2">
          <StarRating value={review.rating} size="small" />
          <span className="text-sm font-bold">{review.title}</span>
        </div>
        <div className="text-xs text-gray-600 mb-3">{reviewDate}</div>

        {/* Comment */}
        <div className="text-sm text-gray-800 mb-4 whitespace-pre-wrap">
          {review.comment}
        </div>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4">
            {review.images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image.imageUrl)}
                className="relative w-20 h-20 border border-gray-300 rounded overflow-hidden hover:opacity-75 transition-opacity"
              >
                <Image
                  src={image.imageUrl}
                  alt="Review image"
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Actions (Edit/Delete for own reviews) */}
        {isOwnReview && (
          <div className="flex gap-3 mt-4">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
              >
                編集
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('このレビューを削除しますか？')) {
                    onDelete(review.id);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                削除
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
      >
        <DialogContent className="p-0">
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage}
                alt="Review image"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
