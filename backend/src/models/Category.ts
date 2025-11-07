import pool from '../config/database';

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export class CategoryModel {
  /**
   * Create a new category
   */
  static async create(data: CreateCategoryData): Promise<Category> {
    const result = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [data.name, data.description]
    );
    return result.rows[0];
  }

  /**
   * Find all categories
   */
  static async findAll(): Promise<Category[]> {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return result.rows;
  }

  /**
   * Find category by ID
   */
  static async findById(id: number): Promise<Category | null> {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find category by name
   */
  static async findByName(name: string): Promise<Category | null> {
    const result = await pool.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  }
}
