import pool from '../config/database';

interface ProductRecommendation {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryId: number | null;
  score: number;
}

interface RecommendationResult {
  recommendations: ProductRecommendation[];
  source: string;
}

export class RecommendationService {
  static async recordView(userId: string, productId: number): Promise<void> {
    const query = `
      INSERT INTO product_views (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET viewed_at = NOW(), view_count = product_views.view_count + 1
    `;
    await pool.query(query, [userId, productId]);
  }

  static async getRecommendations(userId: string, limit: number = 10): Promise<RecommendationResult> {
    // First try category-based recommendations
    const categoryBased = await this.getCategoryBasedRecommendations(userId, limit);
    console.log(`[Recommendation] User: ${userId}, Category-based results: ${categoryBased.length}`);

    if (categoryBased.length > 0) {
      return { recommendations: categoryBased, source: 'category' };
    }

    // Fallback to popular products
    console.log(`[Recommendation] User: ${userId}, Falling back to popular products`);
    const popular = await this.getPopularProductsList(limit);
    return { recommendations: popular, source: 'popular' };
  }

  private static async getCategoryBasedRecommendations(
    userId: string,
    limit: number
  ): Promise<ProductRecommendation[]> {
    const query = `
      WITH user_categories AS (
        SELECT DISTINCT p.category_id, COUNT(*) as view_count
        FROM product_views pv
        JOIN products p ON pv.product_id = p.id
        WHERE pv.user_id = $1
          AND pv.viewed_at > NOW() - INTERVAL '30 days'
          AND p.category_id IS NOT NULL
        GROUP BY p.category_id
        ORDER BY view_count DESC
        LIMIT 5
      )
      SELECT
        p.id,
        p.name,
        p.price,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1)
        ) as image_url,
        p.category_id,
        (uc.view_count * 10 + COALESCE(
          (SELECT COUNT(*) FROM product_views WHERE product_id = p.id), 0
        )) as score
      FROM products p
      JOIN user_categories uc ON p.category_id = uc.category_id
      WHERE p.is_active = TRUE
        AND p.stock > 0
      ORDER BY score DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      imageUrl: row.image_url,
      categoryId: row.category_id,
      score: parseFloat(row.score) || 0
    }));
  }

  private static async getPopularProductsList(limit: number): Promise<ProductRecommendation[]> {
    const query = `
      SELECT
        p.id,
        p.name,
        p.price,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1)
        ) as image_url,
        p.category_id,
        COUNT(pv.id) as view_count
      FROM products p
      LEFT JOIN product_views pv ON p.id = pv.product_id
      WHERE p.is_active = TRUE
        AND p.stock > 0
      GROUP BY p.id
      ORDER BY view_count DESC, p.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      imageUrl: row.image_url,
      categoryId: row.category_id,
      score: parseFloat(row.view_count) || 0
    }));
  }

  static async getSimilarProducts(productId: number, limit: number = 10): Promise<RecommendationResult> {
    const query = `
      WITH target_product AS (
        SELECT category_id FROM products WHERE id = $1
      )
      SELECT
        p.id,
        p.name,
        p.price,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1)
        ) as image_url,
        p.category_id,
        COALESCE(
          (SELECT COUNT(*) FROM product_views WHERE product_id = p.id), 0
        ) as score
      FROM products p, target_product tp
      WHERE p.category_id = tp.category_id
        AND p.id != $1
        AND p.is_active = TRUE
        AND p.stock > 0
      ORDER BY score DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [productId, limit]);
    const recommendations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      imageUrl: row.image_url,
      categoryId: row.category_id,
      score: parseFloat(row.score) || 0
    }));

    return { recommendations, source: 'similar' };
  }

  static async getPopularProducts(limit: number = 10): Promise<RecommendationResult> {
    const recommendations = await this.getPopularProductsList(limit);
    return { recommendations, source: 'popular' };
  }
}
