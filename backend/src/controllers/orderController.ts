import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrderModel } from '../models/Order';
import { CartModel } from '../models/Cart';
import { ProductModel } from '../models/Product';

/**
 * Get all orders for current user
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const orders = await OrderModel.findByUserId(req.user.id);

    // Format response with shipping addresses
    const formattedOrders = orders.map((order) => ({
      ...order,
      shippingAddress: {
        fullName: order.address_full_name,
        postalCode: order.address_postal_code,
        prefecture: order.address_prefecture,
        city: order.address_city,
        addressLine: order.address_address_line,
        building: order.address_building,
        phoneNumber: order.address_phone_number,
      },
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const order = await OrderModel.findById(parseInt(id), req.user.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Format response with shipping address
    const formattedOrder = {
      ...order,
      shippingAddress: {
        fullName: order.address_full_name,
        postalCode: order.address_postal_code,
        prefecture: order.address_prefecture,
        city: order.address_city,
        addressLine: order.address_address_line,
        building: order.address_building,
        phoneNumber: order.address_phone_number,
      },
    };

    res.json({ order: formattedOrder });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

/**
 * Create new order from cart
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { addressId, paymentMethod } = req.body;

    // Get cart with items
    const cart = await CartModel.getCartWithItems(req.user.id);

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await ProductModel.findById(item.product_id);

      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.product_name}` });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({ error: `Product is not available: ${product.name}` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order
    const order = await OrderModel.create({
      userId: req.user.id,
      addressId: parseInt(addressId),
      items: orderItems,
      totalAmount,
      paymentMethod,
    });

    // Clear cart
    await CartModel.clearCart(req.user.id);

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
