import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CartModel, CartWithItems } from '../models/Cart';

/**
 * Transform cart data to frontend format
 */
function transformCartForFrontend(cart: CartWithItems | null) {
  if (!cart) {
    return {
      id: '',
      userId: '',
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }

  const transformedItems = cart.items.map((item) => ({
    id: item.id.toString(),
    productId: item.product_id.toString(),
    quantity: item.quantity,
    product: {
      id: item.product_id.toString(),
      name: item.product_name || '',
      price: item.product_price || 0,
      imageUrl: item.product_image_url || null,
      stock: item.product_stock || 0,
    },
  }));

  const totalItems = transformedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = transformedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    id: cart.id.toString(),
    userId: cart.user_id,
    items: transformedItems,
    totalItems,
    totalPrice,
  };
}

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
    const transformedCart = transformCartForFrontend(cart);

    res.json({ cart: transformedCart });
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

    await CartModel.addItem(req.user.id, parseInt(productId), parseInt(quantity));

    // Return updated cart
    const cart = await CartModel.getCartWithItems(req.user.id);
    const transformedCart = transformCartForFrontend(cart);

    res.status(201).json({
      message: 'Item added to cart',
      cart: transformedCart,
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

    // Return updated cart
    const cart = await CartModel.getCartWithItems(req.user.id);
    const transformedCart = transformCartForFrontend(cart);

    res.json({
      message: 'Cart item updated',
      cart: transformedCart,
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

    // Return updated cart
    const cart = await CartModel.getCartWithItems(req.user.id);
    const transformedCart = transformCartForFrontend(cart);

    res.json({
      message: 'Item removed from cart',
      cart: transformedCart,
    });
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
