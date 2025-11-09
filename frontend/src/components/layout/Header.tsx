"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IoLocationOutline,
  IoSearchOutline,
  IoCartOutline,
  IoChevronDown
} from "react-icons/io5";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();

  // ユーザーの名前（姓名の最初の部分を取得）
  const firstName = user?.name?.split(/[\s　]/)[0] || "";

  // カートのアイテム数
  const cartCount = cart?.totalItems ?? 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-[#131921] text-white sticky top-0 z-50">
      <div className="mx-auto max-w-[1500px] px-4">
        <div className="flex items-center gap-3 h-[60px]">

          {/* 左セクション */}
          <div className="flex items-center gap-3">
            {/* ロゴ */}
            <Link
              href="/"
              className="flex items-center p-2 border border-transparent rounded-sm hover:border-white/30 transition-all"
            >
              <Image
                src="/amazon-com-light.svg"
                alt="Amazon"
                width={100}
                height={30}
                priority
                className="h-8 w-auto"
              />
              <span className="text-xs ml-1">.jp</span>
            </Link>

            {/* お届け先 */}
            <div className="flex items-start gap-1 p-2 cursor-pointer border border-transparent rounded-sm hover:border-white/30 transition-all">
              <IoLocationOutline className="text-xl mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-300 leading-tight">お届け先</span>
                <span className="text-[14px] font-bold leading-tight">日本</span>
              </div>
            </div>
          </div>

          {/* 中央セクション - 検索バー */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-1 max-w-[900px] h-10"
          >
            {/* カテゴリドロップダウン */}
            <button
              type="button"
              className="flex items-center gap-1 px-3 bg-[#E6E6E6] text-[#333] text-sm rounded-l hover:bg-[#D5D5D5] transition-colors"
            >
              <span>すべて</span>
              <IoChevronDown className="text-lg" />
            </button>

            {/* 検索入力 */}
            <input
              type="text"
              placeholder="検索 Amazon.jp"
              className="flex-1 px-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#FF9900]"
            />

            {/* 検索ボタン */}
            <button
              type="submit"
              className="flex items-center justify-center w-11 bg-[#FEBD69] rounded-r hover:bg-[#F3A847] transition-colors"
            >
              <IoSearchOutline className="text-2xl text-[#131921]" />
            </button>
          </form>

          {/* 右セクション */}
          <div className="flex items-center gap-3">
            {/* アカウント&リスト */}
            <div className="flex flex-col p-2 cursor-pointer border border-transparent rounded-sm hover:border-white/30 transition-all">
              <span className="text-[11px] text-gray-300 leading-tight">
                {isAuthenticated ? `こんにちは, ${firstName}` : "ログイン"}
              </span>
              <div className="flex items-center">
                <span className="text-[14px] font-bold leading-tight">アカウント&リスト</span>
                <IoChevronDown className="text-base" />
              </div>
            </div>

            {/* 返品もこちら 注文履歴 */}
            <Link
              href="/orders"
              className="flex flex-col p-2 border border-transparent rounded-sm hover:border-white/30 transition-all"
            >
              <span className="text-[11px] text-gray-300 leading-tight">返品もこちら</span>
              <span className="text-[14px] font-bold leading-tight">注文履歴</span>
            </Link>

            {/* カート */}
            <Link
              href="/cart"
              className="relative flex flex-col items-center p-2 border border-transparent rounded-sm hover:border-white/30 transition-all"
            >
              <div className="relative">
                <IoCartOutline className="text-[28px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#F08804] text-white text-base font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[14px] font-bold mt-1">カート</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
