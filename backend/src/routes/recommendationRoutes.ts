import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// Record product view (requires auth)
router.post('/views', authMiddleware, RecommendationController.recordView);

// Get personalized recommendations (requires auth)
router.get('/user', authMiddleware, RecommendationController.getRecommendations);

// Get similar products (no auth required)
router.get('/similar/:productId', optionalAuthMiddleware, RecommendationController.getSimilarProducts);

// Get popular products (no auth required)
router.get('/popular', optionalAuthMiddleware, RecommendationController.getPopularProducts);

export default router;
