import pool from '../config/database';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id?: number;
  image_url?: string;
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
  page?: number;
  limit?: number;
}

export class ProductModel {
  /**
   * Create a new product
   */
  static async create(data: CreateProductData): Promise<Product> {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.description, data.price, data.stock, data.categoryId, data.imageUrl]
    );
    return result.rows[0];
  }

  /**
   * Find product by ID
   */
  static async findById(id: number): Promise<Product | null> {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all products with filters
   */
  static async findAll(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.categoryId) {
      conditions.push(`category_id = $${paramCount}`);
      values.push(filters.categoryId);
      paramCount++;
    }

    if (filters.minPrice !== undefined) {
      conditions.push(`price >= $${paramCount}`);
      values.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(`price <= $${paramCount}`);
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${paramCount}`);
      values.push(filters.isActive);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated products
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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

    if (data.imageUrl !== undefined) {
      fields.push(`image_url = $${paramCount}`);
      values.push(data.imageUrl);
      paramCount++;
    }

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
}
