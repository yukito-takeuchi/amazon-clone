import pool from '../config/database';

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  firebaseUid: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data: CreateUserData): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, name, is_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.firebaseUid, data.email, data.name, data.isAdmin || false]
    );
    return result.rows[0];
  }

  /**
   * Find user by Firebase UID
   */
  static async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Update user
   */
  static async update(id: string, data: UpdateUserData): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount}`);
      values.push(data.avatarUrl);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}
