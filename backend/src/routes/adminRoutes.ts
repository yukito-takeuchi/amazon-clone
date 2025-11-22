import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateUser, requireAdmin } from '../middleware/auth';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  setMainProductImage,
  uploadMiddleware,
  uploadMultipleMiddleware,
  createCategory,
} from '../controllers/adminProductController';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateUser);
router.use(requireAdmin);

const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
];

/**
 * @route   GET /api/admin/products
 * @desc    Get all products (including inactive)
 * @access  Private/Admin
 */
router.get('/products', getAllProducts);

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Private/Admin
 */
router.post('/products', validate(productValidation), createProduct);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put('/products/:id', updateProduct);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product
 * @access  Private/Admin
 */
router.delete('/products/:id', deleteProduct);

/**
 * @route   POST /api/admin/products/:id/image
 * @desc    Upload single product image (backward compatibility)
 * @access  Private/Admin
 */
router.post('/products/:id/image', uploadMiddleware, uploadProductImage);

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Upload multiple product images
 * @access  Private/Admin
 */
router.post('/products/:id/images', uploadMultipleMiddleware, uploadProductImages);

/**
 * @route   DELETE /api/admin/products/:productId/images/:imageId
 * @desc    Delete a specific product image
 * @access  Private/Admin
 */
router.delete('/products/:productId/images/:imageId', deleteProductImage);

/**
 * @route   PUT /api/admin/products/:productId/images/:imageId/main
 * @desc    Set image as main image
 * @access  Private/Admin
 */
router.put('/products/:productId/images/:imageId/main', setMainProductImage);

/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
router.post(
  '/categories',
  validate([
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').optional().isString(),
  ]),
  createCategory
);

export default router;
