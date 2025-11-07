import pool from '../config/database';

export interface Address {
  id: number;
  user_id: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line: string;
  building?: string;
  phone_number: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAddressData {
  userId: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  building?: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine?: string;
  building?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

export class AddressModel {
  /**
   * Create a new address
   */
  static async create(data: CreateAddressData): Promise<Address> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If this is set as default, unset other default addresses
      if (data.isDefault) {
        await client.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [data.userId]
        );
      }

      const result = await client.query(
        `INSERT INTO addresses (user_id, postal_code, prefecture, city, address_line, building, phone_number, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.userId,
          data.postalCode,
          data.prefecture,
          data.city,
          data.addressLine,
          data.building,
          data.phoneNumber,
          data.isDefault || false,
        ]
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
   * Find all addresses for a user
   */
  static async findByUserId(userId: string): Promise<Address[]> {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return result.rows;
  }

  /**
   * Find address by ID
   */
  static async findById(id: number): Promise<Address | null> {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Update address
   */
  static async update(id: number, userId: string, data: UpdateAddressData): Promise<Address | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If setting this as default, unset other default addresses
      if (data.isDefault) {
        await client.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2',
          [userId, id]
        );
      }

      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.postalCode !== undefined) {
        fields.push(`postal_code = $${paramCount}`);
        values.push(data.postalCode);
        paramCount++;
      }

      if (data.prefecture !== undefined) {
        fields.push(`prefecture = $${paramCount}`);
        values.push(data.prefecture);
        paramCount++;
      }

      if (data.city !== undefined) {
        fields.push(`city = $${paramCount}`);
        values.push(data.city);
        paramCount++;
      }

      if (data.addressLine !== undefined) {
        fields.push(`address_line = $${paramCount}`);
        values.push(data.addressLine);
        paramCount++;
      }

      if (data.building !== undefined) {
        fields.push(`building = $${paramCount}`);
        values.push(data.building);
        paramCount++;
      }

      if (data.phoneNumber !== undefined) {
        fields.push(`phone_number = $${paramCount}`);
        values.push(data.phoneNumber);
        paramCount++;
      }

      if (data.isDefault !== undefined) {
        fields.push(`is_default = $${paramCount}`);
        values.push(data.isDefault);
        paramCount++;
      }

      if (fields.length === 0) {
        await client.query('COMMIT');
        return this.findById(id);
      }

      values.push(id, userId);

      const result = await client.query(
        `UPDATE addresses SET ${fields.join(', ')}
         WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
         RETURNING *`,
        values
      );

      await client.query('COMMIT');
      return result.rows[0] || null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete address
   */
  static async delete(id: number, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}
