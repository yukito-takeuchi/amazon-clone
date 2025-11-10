"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Paper } from "@mui/material";
import { productsApi } from "@/lib/api/products";
import { cartApi } from "@/lib/api/cart";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useSnackbar } from "@/hooks/useSnackbar";
import { LeftFilterSidebar } from "@/components/products/LeftFilterSidebar";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 現在の検索条件における価格範囲（検索・カテゴリ変更時に更新）
  const [currentMinPrice, setCurrentMinPrice] = useState<number>(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(100000);

  // 前回の検索クエリとカテゴリを保持（変更検知用）
  const [prevSearch, setPrevSearch] = useState<string | null>(null);
  const [prevCategory, setPrevCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const minPriceParam = searchParams.get("minPrice");
      const maxPriceParam = searchParams.get("maxPrice");
      const searchQuery = searchParams.get("search") || null;
      const categoryId = searchParams.get("category") || null;

      const filters = {
        search: searchQuery || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPriceParam ? parseInt(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam) : undefined,
        page,
        limit: 12,
      };

      const response = await productsApi.getAll(filters);
      setProducts(response.products);
      setTotalPages(response.totalPages);

      // 検索クエリまたはカテゴリが変更された場合のみ価格範囲を更新
      const searchChanged = searchQuery !== prevSearch;
      const categoryChanged = categoryId !== prevCategory;

      if ((searchChanged || categoryChanged) && response.products.length > 0) {
        const minPrice = Math.min(...response.products.map((p) => p.price));
        const maxPrice = Math.max(...response.products.map((p) => p.price));
        setCurrentMinPrice(minPrice);
        setCurrentMaxPrice(maxPrice);
        setPrevSearch(searchQuery);
        setPrevCategory(categoryId);
      } else if (prevSearch === null && prevCategory === null && response.products.length > 0) {
        // 初回ロード時
        const minPrice = Math.min(...response.products.map((p) => p.price));
        const maxPrice = Math.max(...response.products.map((p) => p.price));
        setCurrentMinPrice(minPrice);
        setCurrentMaxPrice(maxPrice);
        setPrevSearch(searchQuery);
        setPrevCategory(categoryId);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const updatedCart = await cartApi.addItem({ productId, quantity: 1 });
      setCart(updatedCart);
      showSnackbar("カートに追加しました", "success");
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      showSnackbar(
        error.response?.data?.message || "カートに追加できませんでした",
        "error"
      );
    }
  };

  const currentSearch = searchParams.get("search");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F3F4F6" }}>
      <SnackbarComponent />

      {/* メインレイアウト */}
      <Box sx={{ display: "flex" }}>
        {/* 左サイドバー - フィルター */}
        <Box
          sx={{
            width: "16%",
            minWidth: 200,
            display: { xs: "none", md: "block" },
          }}
        >
          <LeftFilterSidebar
            minProductPrice={currentMinPrice}
            maxProductPrice={currentMaxPrice}
          />
        </Box>

        {/* メインコンテンツ */}
        <Box
          sx={{
            flex: 1,
            px: 3,
            py: 3,
          }}
        >
          {/* 検索結果ヘッダー */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#111827", mb: 2 }}
            >
              {currentSearch ? `"${currentSearch}" の検索結果` : "商品一覧"}
            </Typography>
            {!isLoading && products.length > 0 && (
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                {products.length} 件の結果
              </Typography>
            )}
          </Box>

          {/* 商品グリッド */}
          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography sx={{ color: "#6B7280" }}>読み込み中...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Typography sx={{ color: "#6B7280" }}>
                商品が見つかりませんでした
              </Typography>
            </Paper>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                  mb: 4,
                }}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </Box>

              {/* ページネーション */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    前へ
                  </Button>
                  <Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
                    <Typography>
                      {page} / {totalPages}
                    </Typography>
                  </Box>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    次へ
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
