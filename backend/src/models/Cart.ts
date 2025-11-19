import pool from '../config/database';

export interface Cart {
  id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  // Joined fields from product
  product_name?: string;
  product_price?: number;
  product_image_url?: string;
  product_stock?: number;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
}

export class CartModel {
  /**
   * Get or create cart for user
   */
  static async getOrCreateCart(userId: string): Promise<Cart> {
    const client = await pool.connect();
    try {
      // Try to find existing cart
      let result = await client.query(
        'SELECT * FROM carts WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Create new cart
      result = await client.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
        [userId]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Get cart with items
   */
  static async getCartWithItems(userId: string): Promise<CartWithItems | null> {
    const cart = await this.getOrCreateCart(userId);

    const result = await pool.query(
      `SELECT
        ci.*,
        p.name as product_name,
        p.price as product_price,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as product_image_url,
        p.stock as product_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    return {
      ...cart,
      items: result.rows,
    };
  }

  /**
   * Add item to cart
   */
  static async addItem(userId: string, productId: number, quantity: number): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if item already exists in cart
      const existingResult = await client.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cart.id, productId]
      );

      let result;
      if (existingResult.rows.length > 0) {
        // Update quantity
        result = await client.query(
          'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
          [quantity, cart.id, productId]
        );
      } else {
        // Insert new item
        result = await client.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
          [cart.id, productId, quantity]
        );
      }

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
   * Update cart item quantity
   */
  static async updateItemQuantity(userId: string, itemId: number, quantity: number): Promise<CartItem | null> {
    const cart = await this.getOrCreateCart(userId);

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING *',
      [quantity, itemId, cart.id]
    );

    return result.rows[0] || null;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: string, itemId: number): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
      [itemId, cart.id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Clear all items from cart
   */
  static async clearCart(userId: string): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);

    const result = await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1',
      [cart.id]
    );

    return true;
  }
}
