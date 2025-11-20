import React, { useState, useEffect } from 'react';
import { Button, Grid } from '@mui/material';
import { Review, CreateReviewData } from '@/types/review';
import { reviewApi } from '@/lib/api/review';
import { ReviewStats } from './ReviewStats';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface ReviewSectionProps {
  productId: number;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { user } = useAuthStore();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>();

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await reviewApi.getProductReviews(productId);
      setReviews(data.reviews);
      setAverageRating(data.summary.averageRating);
      setTotalCount(data.summary.totalCount);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Check if user has already reviewed
  const userReview = reviews.find((review) => review.user.id === user?.id);

  const handleWriteReviewClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (userReview) {
      // Edit existing review
      setEditingReview(userReview);
      setIsFormOpen(true);
    } else {
      // Create new review
      setEditingReview(undefined);
      setIsFormOpen(true);
    }
  };

  const handleSubmitReview = async (data: CreateReviewData, images: File[]) => {
    if (!user) return;

    try {
      if (editingReview) {
        // Update existing review
        await reviewApi.updateReview(editingReview.id, data);

        // Upload new images if any
        if (images.length > 0) {
          await reviewApi.uploadReviewImages(editingReview.id, images);
        }
      } else {
        // Create new review
        const result = await reviewApi.createReview(productId, data);

        // Upload images if any
        if (images.length > 0 && result.review) {
          await reviewApi.uploadReviewImages(result.review.id, images);
        }
      }

      // Refresh reviews
      await fetchReviews();
      setIsFormOpen(false);
      setEditingReview(undefined);
    } catch (error: any) {
      console.error('Submit review error:', error);
      alert(
        error.response?.data?.error ||
          'レビューの投稿に失敗しました。もう一度お試しください。'
      );
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await reviewApi.deleteReview(reviewId);
      await fetchReviews();
    } catch (error: any) {
      console.error('Delete review error:', error);
      alert(
        error.response?.data?.error ||
          'レビューの削除に失敗しました。もう一度お試しください。'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="py-8" id="customer-reviews">
      <div className="border-t border-gray-300 pt-8">
        <h2 className="text-2xl font-bold mb-6">カスタマーレビュー</h2>

        <Grid container spacing={4}>
          {/* Left: Stats */}
          <Grid item xs={12} md={4}>
            <ReviewStats
              reviews={reviews}
              averageRating={averageRating}
              totalCount={totalCount}
            />

            {/* Write Review Button */}
            <Button
              variant="outlined"
              fullWidth
              onClick={handleWriteReviewClick}
              sx={{
                mt: 3,
                borderColor: '#D5D9D9',
                color: '#0F1111',
                '&:hover': {
                  borderColor: '#888',
                  backgroundColor: '#F7FAFA',
                },
              }}
            >
              {userReview ? 'レビューを編集' : 'レビューを書く'}
            </Button>
          </Grid>

          {/* Right: Review List */}
          <Grid item xs={12} md={8}>
            <ReviewList
              reviews={reviews}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          </Grid>
        </Grid>

        {/* Review Form Modal */}
        <ReviewForm
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingReview(undefined);
          }}
          onSubmit={handleSubmitReview}
          existingReview={editingReview}
          isEdit={!!editingReview}
        />
      </div>
    </div>
  );
};
