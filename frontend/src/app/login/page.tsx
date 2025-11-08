'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // バックエンドAPIでログイン
      const response = await authApi.login(data);

      // Firebaseにカスタムトークンでサインイン
      if (response.customToken) {
        await signInWithCustomToken(auth, response.customToken);
      }

      // ユーザー情報をストアに保存
      setUser(response.user);

      // ホームページへリダイレクト
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#131921]">
            amazon<span className="text-[#FF9900]">.clone</span>
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            ログイン
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="メールアドレス"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="example@email.com"
              disabled={isLoading}
            />

            <Input
              label="パスワード"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="6文字以上"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            ログイン
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <Link
                href="/register"
                className="font-medium text-[#FF9900] hover:text-[#FA8900]"
              >
                新規登録
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
