import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import { Review, CreateReviewData } from '@/types/review';

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReviewData, images: File[]) => Promise<void>;
  existingReview?: Review;
  isEdit?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  open,
  onClose,
  onSubmit,
  existingReview,
  isEdit = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const MAX_IMAGES = 5;

  // Load existing review data when editing
  useEffect(() => {
    if (existingReview && isEdit) {
      setRating(existingReview.rating);
      setTitle(existingReview.title);
      setComment(existingReview.comment);
    } else {
      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
      setImages([]);
      setImagePreviews([]);
    }
    setErrors({});
  }, [existingReview, isEdit, open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      setErrors({
        ...errors,
        images: `画像は最大${MAX_IMAGES}枚までアップロードできます`,
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    // Clear error
    const { images: _, ...rest } = errors;
    setErrors(rest);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (rating < 1 || rating > 5) {
      newErrors.rating = '評価を選択してください';
    }

    if (!title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    } else if (title.length > 255) {
      newErrors.title = 'タイトルは255文字以内で入力してください';
    }

    if (!comment.trim()) {
      newErrors.comment = 'コメントを入力してください';
    } else if (comment.length > 2000) {
      newErrors.comment = 'コメントは2000文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        },
        images
      );
      onClose();
    } catch (error) {
      console.error('Submit review error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div className="flex items-center justify-between">
          <span className="font-bold">
            {isEdit ? 'レビューを編集' : 'レビューを書く'}
          </span>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              総合評価 <span className="text-red-600">*</span>
            </label>
            <Rating
              value={rating}
              onChange={(_, value) => {
                if (value !== null) {
                  setRating(value);
                  const { rating: _, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              size="large"
            />
            {errors.rating && (
              <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <TextField
              label="タイトル"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                const { title: _, ...rest } = errors;
                setErrors(rest);
              }}
              required
              fullWidth
              placeholder="例: コスパ最高"
              error={!!errors.title}
              helperText={errors.title || `${title.length}/255文字`}
              inputProps={{ maxLength: 255 }}
            />
          </div>

          {/* Comment */}
          <div>
            <TextField
              label="コメント"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                const { comment: _, ...rest } = errors;
                setErrors(rest);
              }}
              required
              fullWidth
              multiline
              rows={6}
              placeholder="この商品についての感想を教えてください"
              error={!!errors.comment}
              helperText={errors.comment || `${comment.length}/2000文字`}
              inputProps={{ maxLength: 2000 }}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">
              画像を追加（任意、最大{MAX_IMAGES}枚）
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded border border-gray-300"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < MAX_IMAGES && (
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                sx={{
                  borderColor: '#D5D9D9',
                  color: '#0F1111',
                  '&:hover': {
                    borderColor: '#888',
                    backgroundColor: '#F7FAFA',
                  },
                }}
              >
                画像を選択
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            )}

            {errors.images && (
              <p className="text-red-600 text-sm mt-1">{errors.images}</p>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: '#FFD814',
            color: '#0F1111',
            '&:hover': {
              backgroundColor: '#F7CA00',
            },
          }}
        >
          {isSubmitting ? '送信中...' : isEdit ? '更新' : '投稿'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
