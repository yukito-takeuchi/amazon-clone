import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  addReviewImages,
  deleteReviewImage,
  uploadReviewImagesMiddleware,
} from '../controllers/reviewController';

const router = Router();

// Public routes
router.get('/products/:productId/reviews', getProductReviews);
router.get('/reviews/:id', getReview);

// Protected routes (require authentication)
router.post('/products/:productId/reviews', authenticateUser, createReview);
router.put('/reviews/:id', authenticateUser, updateReview);
router.delete('/reviews/:id', authenticateUser, deleteReview);
router.post('/reviews/:id/images', authenticateUser, uploadReviewImagesMiddleware, addReviewImages);
router.delete('/reviews/:id/images/:imageId', authenticateUser, deleteReviewImage);

export default router;
