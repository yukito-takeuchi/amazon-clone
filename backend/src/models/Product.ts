import pool from '../config/database';

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  is_main: boolean;
  created_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id?: number;
  image_url?: string; // Main image from product_images (for backward compatibility)
  images?: ProductImage[]; // All images
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: number;
  imageUrl?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  stockStatus?: 'in_stock' | 'out_of_stock';
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'price' | 'stock' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export class ProductModel {
  /**
   * Create a new product
   */
  static async create(data: CreateProductData): Promise<Product> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert product without image_url
      const result = await client.query(
        `INSERT INTO products (name, description, price, stock, category_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.name, data.description, data.price, data.stock, data.categoryId]
      );

      const product = result.rows[0];

      // If imageUrl provided, insert into product_images
      if (data.imageUrl) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, display_order, is_main)
           VALUES ($1, $2, 1, TRUE)`,
          [product.id, data.imageUrl]
        );
        product.image_url = data.imageUrl;
      }

      await client.query('COMMIT');
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find product by ID
   */
  static async findById(id: number): Promise<Product | null> {
    const result = await pool.query(
      `SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as image_url
       FROM products p WHERE p.id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    // Get all images
    const imagesResult = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
      [id]
    );

    return {
      ...result.rows[0],
      images: imagesResult.rows,
    };
  }

  /**
   * Find all products with filters
   */
  static async findAll(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.categoryId) {
      conditions.push(`p.category_id = $${paramCount}`);
      values.push(filters.categoryId);
      paramCount++;
    }

    if (filters.minPrice !== undefined) {
      conditions.push(`p.price >= $${paramCount}`);
      values.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(`p.price <= $${paramCount}`);
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.isActive !== undefined) {
      conditions.push(`p.is_active = $${paramCount}`);
      values.push(filters.isActive);
      paramCount++;
    }

    if (filters.stockStatus) {
      if (filters.stockStatus === 'in_stock') {
        conditions.push(`p.stock > 0`);
      } else if (filters.stockStatus === 'out_of_stock') {
        conditions.push(`p.stock = 0`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Build ORDER BY clause
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';

    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['created_at', 'price', 'stock', 'name'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const orderByClause = `ORDER BY p.${sortColumn} ${sortDirection}`;

    // Get paginated products
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as image_url
       FROM products p ${whereClause} ${orderByClause} LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      products: result.rows,
      total,
    };
  }

  /**
   * Update product
   */
  static async update(id: number, data: UpdateProductData): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(data.description);
      paramCount++;
    }

    if (data.price !== undefined) {
      fields.push(`price = $${paramCount}`);
      values.push(data.price);
      paramCount++;
    }

    if (data.stock !== undefined) {
      fields.push(`stock = $${paramCount}`);
      values.push(data.stock);
      paramCount++;
    }

    if (data.categoryId !== undefined) {
      fields.push(`category_id = $${paramCount}`);
      values.push(data.categoryId);
      paramCount++;
    }

    // Note: imageUrl is now managed through product_images table
    // Use setMainImage() or addImage() methods instead

    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramCount}`);
      values.push(data.isActive);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete product (soft delete by setting is_active to false)
   */
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'UPDATE products SET is_active = false WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Hard delete product
   */
  static async hardDelete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Add image to product
   */
  static async addImage(productId: number, imageUrl: string, isMain: boolean = false): Promise<ProductImage> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get next display order
      const orderResult = await client.query(
        'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM product_images WHERE product_id = $1',
        [productId]
      );
      const displayOrder = orderResult.rows[0].next_order;

      // If setting as main, unset other main images
      if (isMain) {
        await client.query(
          'UPDATE product_images SET is_main = FALSE WHERE product_id = $1',
          [productId]
        );
      }

      // Insert new image
      const result = await client.query(
        `INSERT INTO product_images (product_id, image_url, display_order, is_main)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [productId, imageUrl, displayOrder, isMain]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Set main image for product
   */
  static async setMainImage(productId: number, imageId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Unset all main images for this product
      await client.query(
        'UPDATE product_images SET is_main = FALSE WHERE product_id = $1',
        [productId]
      );

      // Set the specified image as main
      const result = await client.query(
        'UPDATE product_images SET is_main = TRUE WHERE id = $1 AND product_id = $2',
        [imageId, productId]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete product image
   */
  static async deleteImage(imageId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM product_images WHERE id = $1',
      [imageId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get all images for product
   */
  static async getImages(productId: number): Promise<ProductImage[]> {
    const result = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
      [productId]
    );
    return result.rows;
  }
}
