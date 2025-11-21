import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RecommendationService } from '../services/recommendationService';

export class RecommendationController {
  static async recordView(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.firebaseUid;
      const { productId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
      }

      await RecommendationService.recordView(userId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error recording view:', error);
      res.status(500).json({ error: 'Failed to record view' });
    }
  }

  static async getRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.firebaseUid;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await RecommendationService.getRecommendations(userId, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  static async getSimilarProducts(req: AuthRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid productId' });
      }

      const result = await RecommendationService.getSimilarProducts(productId, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting similar products:', error);
      res.status(500).json({ error: 'Failed to get similar products' });
    }
  }

  static async getPopularProducts(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await RecommendationService.getPopularProducts(limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting popular products:', error);
      res.status(500).json({ error: 'Failed to get popular products' });
    }
  }
}
