import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import { getOrders, getOrderById, createOrder } from '../controllers/orderController';

const router = express.Router();

// All order routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for current user
 * @access  Private
 */
router.get('/', getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post(
  '/',
  validate([
    body('addressId').isInt().withMessage('Valid address ID is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ]),
  createOrder
);

export default router;
