import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/cart
 * @desc    Get cart with items
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/items',
  validate([
    body('productId').isInt().withMessage('Valid product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ]),
  addItemToCart
);

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put(
  '/items/:id',
  validate([
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ]),
  updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:id', removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', clearCart);

export default router;
