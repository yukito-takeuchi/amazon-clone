import { Request, Response } from 'express';
import { auth } from '../config/firebase';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { signInWithEmailAndPassword } from '../services/firebaseAuthService';

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!auth) {
      res.status(500).json({ error: 'Firebase not initialized' });
      return;
    }

    const { email, password, name } = req.body;

    // Create user in Firebase
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user in database
    const user = await UserModel.create({
      firebaseUid: userRecord.uid,
      email: userRecord.email!,
      name,
      isAdmin: false,
    });

    // Generate custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
      },
      customToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user using Firebase REST API
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!auth) {
      res.status(500).json({ error: 'Firebase not initialized' });
      return;
    }

    const { email, password } = req.body;

    // Authenticate with Firebase REST API
    const firebaseResponse = await signInWithEmailAndPassword(email, password);

    // Get user from database using Firebase UID
    const user = await UserModel.findByFirebaseUid(firebaseResponse.localId);

    if (!user) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    // Generate custom token for client
    const customToken = await auth.createCustomToken(firebaseResponse.localId);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
      },
      customToken,
      idToken: firebaseResponse.idToken,
      expiresIn: firebaseResponse.expiresIn,
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message === 'Invalid email or password') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Get current user information
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await UserModel.findById(req.user.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};
