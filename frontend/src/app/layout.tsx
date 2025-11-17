import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazon Clone - Next.js E-Commerce",
  description: "Full-stack e-commerce application built with Next.js",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
