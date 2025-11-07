import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import { getProfile, updateProfile, uploadAvatar, uploadMiddleware } from '../controllers/userController';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateUser, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateUser,
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  ]),
  updateProfile
);

/**
 * @route   POST /api/users/profile/avatar
 * @desc    Upload profile avatar
 * @access  Private
 */
router.post('/profile/avatar', authenticateUser, uploadMiddleware, uploadAvatar);

export default router;
