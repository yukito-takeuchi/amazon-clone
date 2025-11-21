import pool from '../config/database';

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_avatar_url?: string;
}

export interface ReviewImage {
  id: number;
  review_id: number;
  image_url: string;
  display_order: number;
  created_at: Date;
}

export interface ReviewWithImages extends Review {
  images: ReviewImage[];
}

export interface CreateReviewData {
  productId: number;
  userId: string;
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}

export class ReviewModel {
  /**
   * Create a new review
   */
  static async create(data: CreateReviewData): Promise<Review> {
    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.productId, data.userId, data.rating, data.title, data.comment]
    );
    return result.rows[0];
  }

  /**
   * Find review by ID
   */
  static async findById(id: number): Promise<ReviewWithImages | null> {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    const images = await this.getImages(id);

    return {
      ...result.rows[0],
      images,
    };
  }

  /**
   * Find all reviews for a product
   */
  static async findByProductId(productId: number): Promise<ReviewWithImages[]> {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    // Get images for each review
    const reviewsWithImages = await Promise.all(
      result.rows.map(async (review) => {
        const images = await this.getImages(review.id);
        return {
          ...review,
          images,
        };
      })
    );

    return reviewsWithImages;
  }

  /**
   * Find review by product and user (to check if user already reviewed)
   */
  static async findByProductAndUser(productId: number, userId: string): Promise<Review | null> {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update review
   */
  static async update(id: number, userId: string, data: UpdateReviewData): Promise<Review | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.rating !== undefined) {
      fields.push(`rating = $${paramCount}`);
      values.push(data.rating);
      paramCount++;
    }

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(data.title);
      paramCount++;
    }

    if (data.comment !== undefined) {
      fields.push(`comment = $${paramCount}`);
      values.push(data.comment);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE reviews SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete review
   */
  static async delete(id: number, userId: string, isAdmin: boolean = false): Promise<boolean> {
    let query = 'DELETE FROM reviews WHERE id = $1';
    const params: any[] = [id];

    if (!isAdmin) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Add image to review
   */
  static async addImage(reviewId: number, imageUrl: string): Promise<ReviewImage> {
    // Get next display order
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM review_images WHERE review_id = $1',
      [reviewId]
    );
    const displayOrder = orderResult.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO review_images (review_id, image_url, display_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [reviewId, imageUrl, displayOrder]
    );

    return result.rows[0];
  }

  /**
   * Get all images for a review
   */
  static async getImages(reviewId: number): Promise<ReviewImage[]> {
    const result = await pool.query(
      'SELECT * FROM review_images WHERE review_id = $1 ORDER BY display_order ASC',
      [reviewId]
    );
    return result.rows;
  }

  /**
   * Delete review image
   */
  static async deleteImage(imageId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM review_images WHERE id = $1',
      [imageId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get average rating for a product
   */
  static async getAverageRating(productId: number): Promise<{ average: number; count: number }> {
    const result = await pool.query(
      `SELECT
        COALESCE(AVG(rating), 0) as average,
        COUNT(*) as count
       FROM reviews
       WHERE product_id = $1`,
      [productId]
    );
    return {
      average: parseFloat(result.rows[0].average) || 0,
      count: parseInt(result.rows[0].count) || 0,
    };
  }

  /**
   * Count images for a review
   */
  static async countImages(reviewId: number): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM review_images WHERE review_id = $1',
      [reviewId]
    );
    return parseInt(result.rows[0].count);
  }
}
