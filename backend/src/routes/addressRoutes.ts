import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/addressController';

const router = express.Router();

const addressValidation = [
  body('postalCode').notEmpty().withMessage('Postal code is required'),
  body('prefecture').notEmpty().withMessage('Prefecture is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('addressLine').notEmpty().withMessage('Address line is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean'),
];

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses
 * @access  Private
 */
router.get('/', authenticateUser, getAddresses);

/**
 * @route   POST /api/addresses
 * @desc    Create new address
 * @access  Private
 */
router.post('/', authenticateUser, validate(addressValidation), createAddress);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put('/:id', authenticateUser, validate(addressValidation), updateAddress);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/:id', authenticateUser, deleteAddress);

export default router;
