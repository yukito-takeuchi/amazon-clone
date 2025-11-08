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

const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // バックエンドAPIで新規登録
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Firebaseにカスタムトークンでサインイン
      if (response.customToken) {
        await signInWithCustomToken(auth, response.customToken);
      }

      // ユーザー情報をストアに保存
      setUser(response.user);

      // ホームページへリダイレクト
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        '登録に失敗しました。入力内容を確認してください。'
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
            新規登録
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="名前"
              type="text"
              {...register('name')}
              error={errors.name?.message}
              placeholder="山田 太郎"
              disabled={isLoading}
            />

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

            <Input
              label="パスワード（確認）"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
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
            登録
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link
                href="/login"
                className="font-medium text-[#FF9900] hover:text-[#FA8900]"
              >
                ログイン
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
