import dotenv from 'dotenv';

dotenv.config();

interface FirebaseSignInResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

interface FirebaseErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

/**
 * Sign in with email and password using Firebase REST API
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<FirebaseSignInResponse> {
  const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;

  if (!FIREBASE_WEB_API_KEY) {
    throw new Error('FIREBASE_WEB_API_KEY is not configured');
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as FirebaseErrorResponse;
    const errorMessage = errorData.error?.message || 'Authentication failed';

    // Handle specific Firebase errors
    if (errorMessage.includes('INVALID_PASSWORD') || errorMessage.includes('EMAIL_NOT_FOUND')) {
      throw new Error('Invalid email or password');
    }

    throw new Error(errorMessage);
  }

  return data as FirebaseSignInResponse;
}
