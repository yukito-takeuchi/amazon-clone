import axios from 'axios';

const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;

interface FirebaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: boolean;
}

/**
 * Sign in with email and password using Firebase REST API
 * @param email User email
 * @param password User password
 * @returns Firebase auth response with idToken
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<FirebaseAuthResponse> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;

  const response = await axios.post<FirebaseAuthResponse>(url, {
    email,
    password,
    returnSecureToken: true,
  });

  return response.data;
}
