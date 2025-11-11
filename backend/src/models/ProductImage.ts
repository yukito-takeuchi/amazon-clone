import pool from '../config/database';

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  created_at: Date;
}

export interface CreateProductImageData {
  product_id: number;
  image_url: string;
  display_order: number;
}

export class ProductImageModel {
  // Get all images for a product
  static async getByProductId(productId: number): Promise<ProductImage[]> {
    const result = await pool.query(
      `SELECT * FROM product_images
       WHERE product_id = $1
       ORDER BY display_order ASC`,
      [productId]
    );
    return result.rows;
  }

  // Create a new product image
  static async create(data: CreateProductImageData): Promise<ProductImage> {
    const result = await pool.query(
      `INSERT INTO product_images (product_id, image_url, display_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.product_id, data.image_url, data.display_order]
    );
    return result.rows[0];
  }

  // Create multiple images for a product
  static async createMany(productId: number, imageUrls: string[]): Promise<ProductImage[]> {
    if (imageUrls.length === 0) return [];

    // Get the current max display_order for this product
    const maxOrderResult = await pool.query(
      `SELECT COALESCE(MAX(display_order), 0) as max_order
       FROM product_images
       WHERE product_id = $1`,
      [productId]
    );
    const startOrder = maxOrderResult.rows[0].max_order + 1;

    // Build values for bulk insert
    const values: any[] = [];
    const placeholders: string[] = [];

    imageUrls.forEach((url, index) => {
      const order = startOrder + index;
      const offset = index * 3;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
      values.push(productId, url, order);
    });

    const query = `
      INSERT INTO product_images (product_id, image_url, display_order)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Delete a specific image
  static async delete(imageId: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM product_images WHERE id = $1 RETURNING id`,
      [imageId]
    );
    return result.rows.length > 0;
  }

  // Delete all images for a product
  static async deleteByProductId(productId: number): Promise<number> {
    const result = await pool.query(
      `DELETE FROM product_images WHERE product_id = $1 RETURNING id`,
      [productId]
    );
    return result.rows.length;
  }

  // Get a single image by ID
  static async getById(imageId: number): Promise<ProductImage | null> {
    const result = await pool.query(
      `SELECT * FROM product_images WHERE id = $1`,
      [imageId]
    );
    return result.rows[0] || null;
  }

  // Reorder images after deletion to maintain sequential order
  static async reorderAfterDeletion(productId: number): Promise<void> {
    await pool.query(
      `WITH ordered_images AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY display_order) as new_order
        FROM product_images
        WHERE product_id = $1
      )
      UPDATE product_images
      SET display_order = ordered_images.new_order
      FROM ordered_images
      WHERE product_images.id = ordered_images.id`,
      [productId]
    );
  }

  // Count images for a product
  static async countByProductId(productId: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM product_images WHERE product_id = $1`,
      [productId]
    );
    return parseInt(result.rows[0].count);
  }
}
