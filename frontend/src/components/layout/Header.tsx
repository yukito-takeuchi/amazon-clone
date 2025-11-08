'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AmazonIcon } from './AmazonIcon';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-[#131921] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Amazon style */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <AmazonIcon className="text-white" width={32} height={32} />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-white">amazon.clone</span>
              <span className="text-[10px] text-gray-400 leading-none">.co.jp</span>
            </div>
            <div className="flex items-center ml-1">
              <span className="text-[10px] font-bold bg-[#FF9900] text-[#131921] px-1.5 py-0.5 rounded leading-none">
                Prime
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/products"
                  className="hover:text-[#FF9900] transition-colors"
                >
                  商品一覧
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center space-x-1 hover:text-[#FF9900] transition-colors"
                >
                  <FiShoppingCart className="text-xl" />
                  <span>カート</span>
                </Link>
                <Link
                  href="/orders"
                  className="hover:text-[#FF9900] transition-colors"
                >
                  注文履歴
                </Link>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 hover:text-[#FF9900] transition-colors"
                  >
                    <FiUser className="text-xl" />
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-[#FF9900] transition-colors"
                  >
                    <FiLogOut className="text-xl" />
                    <span>ログアウト</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-[#FF9900] transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="bg-[#FF9900] hover:bg-[#FA8900] px-4 py-2 rounded transition-colors"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
