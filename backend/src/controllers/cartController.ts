import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CartModel } from '../models/Cart';

/**
 * Get cart with items
 */
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const cart = await CartModel.getCartWithItems(req.user.id);

    res.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { productId, quantity = 1 } = req.body;

    const item = await CartModel.addItem(req.user.id, parseInt(productId), parseInt(quantity));

    res.status(201).json({
      message: 'Item added to cart',
      item,
    });
  } catch (error) {
    console.error('Add item to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const item = await CartModel.updateItemQuantity(req.user.id, parseInt(id), parseInt(quantity));

    if (!item) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    res.json({
      message: 'Cart item updated',
      item,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const deleted = await CartModel.removeItem(req.user.id, parseInt(id));

    if (!deleted) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await CartModel.clearCart(req.user.id);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
