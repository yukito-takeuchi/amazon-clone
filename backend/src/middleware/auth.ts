import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import pool from '../config/database';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    isAdmin: boolean;
  };
}

/**
 * Verify Firebase JWT token and attach user to request
 */
export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!auth) {
      res.status(500).json({ error: 'Firebase not initialized' });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Get user from database
    const result = await pool.query(
      'SELECT id, firebase_uid, email, is_admin FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Attach user to request
    req.user = {
      id: user.id,
      firebaseUid: user.firebase_uid,
      email: user.email,
      isAdmin: user.is_admin,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Check if authenticated user is admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

// Alias for authenticateUser
export const authMiddleware = authenticateUser;

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || !auth) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const result = await pool.query(
      'SELECT id, firebase_uid, email, is_admin FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.user = {
        id: user.id,
        firebaseUid: user.firebase_uid,
        email: user.email,
        isAdmin: user.is_admin,
      };
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};
