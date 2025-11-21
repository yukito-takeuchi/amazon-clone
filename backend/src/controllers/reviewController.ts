import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReviewModel } from '../models/Review';
import { ProductModel } from '../models/Product';
import { uploadFile } from '../services/uploadService';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Create a new review for a product
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await ProductModel.findById(parseInt(productId));
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await ReviewModel.findByProductAndUser(parseInt(productId), userId);
    if (existingReview) {
      res.status(400).json({ error: 'You have already reviewed this product' });
      return;
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Validate title
    if (!title || title.length < 1 || title.length > 255) {
      res.status(400).json({ error: 'Title must be between 1 and 255 characters' });
      return;
    }

    // Validate comment
    if (!comment || comment.length < 1 || comment.length > 2000) {
      res.status(400).json({ error: 'Comment must be between 1 and 2000 characters' });
      return;
    }

    const review = await ReviewModel.create({
      productId: parseInt(productId),
      userId,
      rating,
      title,
      comment,
    });

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review.id,
        productId: review.product_id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: [],
        createdAt: review.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create review error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      res.status(400).json({ error: 'You have already reviewed this product' });
      return;
    }

    res.status(500).json({ error: 'Failed to create review' });
  }
};

/**
 * Get all reviews for a product
 */
export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await ProductModel.findById(parseInt(productId));
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const reviews = await ReviewModel.findByProductId(parseInt(productId));
    const { average, count } = await ReviewModel.getAverageRating(parseInt(productId));

    res.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        user: {
          id: review.user_id,
          name: review.user_name,
          avatarUrl: review.user_avatar_url,
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images.map((img) => ({
          id: img.id,
          imageUrl: img.image_url,
          displayOrder: img.display_order,
        })),
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      })),
      summary: {
        averageRating: Math.round(average * 10) / 10,
        totalCount: count,
      },
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

/**
 * Get a single review by ID
 */
export const getReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await ReviewModel.findById(parseInt(id));
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json({
      review: {
        id: review.id,
        productId: review.product_id,
        user: {
          id: review.user_id,
          name: review.user_name,
          avatarUrl: review.user_avatar_url,
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images.map((img) => ({
          id: img.id,
          imageUrl: img.image_url,
          displayOrder: img.display_order,
        })),
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      },
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
};

/**
 * Update a review
 */
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user!.id;

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Validate title if provided
    if (title !== undefined && (title.length < 1 || title.length > 255)) {
      res.status(400).json({ error: 'Title must be between 1 and 255 characters' });
      return;
    }

    // Validate comment if provided
    if (comment !== undefined && (comment.length < 1 || comment.length > 2000)) {
      res.status(400).json({ error: 'Comment must be between 1 and 2000 characters' });
      return;
    }

    const review = await ReviewModel.update(parseInt(id), userId, {
      rating,
      title,
      comment,
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found or you do not have permission to update it' });
      return;
    }

    res.json({
      message: 'Review updated successfully',
      review: {
        id: review.id,
        productId: review.product_id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        updatedAt: review.updated_at,
      },
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.isAdmin;

    const deleted = await ReviewModel.delete(parseInt(id), userId, isAdmin);

    if (!deleted) {
      res.status(404).json({ error: 'Review not found or you do not have permission to delete it' });
      return;
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

/**
 * Add images to a review
 */
export const addReviewImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Check if review exists and belongs to user
    const review = await ReviewModel.findById(parseInt(id));
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.user_id !== userId) {
      res.status(403).json({ error: 'You do not have permission to add images to this review' });
      return;
    }

    // Check current image count
    const currentCount = await ReviewModel.countImages(parseInt(id));
    const MAX_IMAGES = 5;

    if (currentCount + req.files.length > MAX_IMAGES) {
      res.status(400).json({
        error: `Maximum ${MAX_IMAGES} images allowed per review. Current: ${currentCount}, Attempting to add: ${req.files.length}`,
      });
      return;
    }

    // Upload all files
    const uploadPromises = req.files.map((file) => uploadFile(file, 'reviews'));
    const uploadResults = await Promise.all(uploadPromises);

    // Create image records
    const images = await Promise.all(
      uploadResults.map((result) => ReviewModel.addImage(parseInt(id), result.url))
    );

    res.status(201).json({
      message: 'Review images uploaded successfully',
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.image_url,
        displayOrder: img.display_order,
      })),
    });
  } catch (error) {
    console.error('Add review images error:', error);
    res.status(500).json({ error: 'Failed to upload review images' });
  }
};

/**
 * Delete a review image
 */
export const deleteReviewImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user!.id;

    // Check if review exists and belongs to user
    const review = await ReviewModel.findById(parseInt(id));
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.user_id !== userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'You do not have permission to delete this image' });
      return;
    }

    const deleted = await ReviewModel.deleteImage(parseInt(imageId));

    if (!deleted) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.json({ message: 'Review image deleted successfully' });
  } catch (error) {
    console.error('Delete review image error:', error);
    res.status(500).json({ error: 'Failed to delete review image' });
  }
};

export const uploadReviewImagesMiddleware = upload.array('images', 5);
