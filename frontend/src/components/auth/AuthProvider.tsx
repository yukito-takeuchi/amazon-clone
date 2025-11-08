'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { User } from '@/types/auth';

/**
 * AuthProvider - Firebase認証状態を監視し、Zustandストアを更新
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // 認証状態の監視を開始
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase認証が有効な場合、バックエンドからユーザー情報を取得
        try {
          // トークンを取得
          const token = await firebaseUser.getIdToken();
          
          // バックエンドAPIからユーザー情報を取得（リダイレクトを防ぐため直接axiosを使用）
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const userData: User = response.data.user;
          setUser(userData);
        } catch (error: any) {
          console.error('Failed to fetch user data:', error);
          // バックエンドから取得できなかった場合、Firebaseからサインアウト
          if (error.response?.status === 401 || error.response?.status === 404) {
            await signOut(auth);
            setUser(null);
          }
        }
      } else {
        // Firebase認証が無効な場合、ストアをクリア
        setUser(null);
      }
      setLoading(false);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

