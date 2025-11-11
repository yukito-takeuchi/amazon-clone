import pool from '../config/database';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  user_id: string;
  address_id?: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  created_at: Date;
  updated_at: Date;
  // Address fields (from JOIN)
  address_full_name?: string;
  address_postal_code?: string;
  address_prefecture?: string;
  address_city?: string;
  address_address_line?: string;
  address_building?: string;
  address_phone_number?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  quantity: number;
  price: number;
  created_at: Date;
  // Joined fields
  product_name?: string;
  product_image_url?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderData {
  userId: string;
  addressId: number;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
}

export class OrderModel {
  /**
   * Create a new order
   */
  static async create(data: CreateOrderData): Promise<OrderWithItems> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, address_id, total_amount, payment_method, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [data.userId, data.addressId, data.totalAmount, data.paymentMethod]
      );

      const order = orderResult.rows[0];

      // Create order items
      const items: OrderItem[] = [];
      for (const item of data.items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [order.id, item.productId, item.quantity, item.price]
        );
        items.push(itemResult.rows[0]);

        // Update product stock
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      await client.query('COMMIT');

      return {
        ...order,
        items,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find order by ID with items
   */
  static async findById(id: number, userId: string): Promise<OrderWithItems | null> {
    const orderResult = await pool.query(
      `SELECT
        o.*,
        a.full_name as address_full_name,
        a.postal_code as address_postal_code,
        a.prefecture as address_prefecture,
        a.city as address_city,
        a.address_line as address_address_line,
        a.building as address_building,
        a.phone_number as address_phone_number
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.name as product_name,
        p.image_url as product_image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [id]
    );

    return {
      ...order,
      items: itemsResult.rows,
    };
  }

  /**
   * Find all orders for a user
   */
  static async findByUserId(userId: string): Promise<Order[]> {
    const result = await pool.query(
      `SELECT
        o.*,
        a.full_name as address_full_name,
        a.postal_code as address_postal_code,
        a.prefecture as address_prefecture,
        a.city as address_city,
        a.address_line as address_address_line,
        a.building as address_building,
        a.phone_number as address_phone_number
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Update order status
   */
  static async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }

  /**
   * Update order with Stripe information
   */
  static async updateStripeInfo(
    id: number,
    data: { stripeSessionId: string; stripePaymentIntentId: string }
  ): Promise<Order | null> {
    const result = await pool.query(
      'UPDATE orders SET stripe_session_id = $1, stripe_payment_intent_id = $2 WHERE id = $3 RETURNING *',
      [data.stripeSessionId, data.stripePaymentIntentId, id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find order by Stripe session ID
   */
  static async findByStripeSessionId(sessionId: string): Promise<OrderWithItems | null> {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE stripe_session_id = $1',
      [sessionId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.name as product_name,
        p.image_url as product_image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [order.id]
    );

    return {
      ...order,
      items: itemsResult.rows,
    };
  }
}
