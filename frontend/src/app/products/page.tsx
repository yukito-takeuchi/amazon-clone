"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>('created_at_desc');

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const initialLoadRef = useRef(false);

  // 現在の検索条件における価格範囲（検索・カテゴリ変更時に更新）
  const [currentMinPrice, setCurrentMinPrice] = useState<number>(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(100000);

  // 前回の検索クエリとカテゴリを保持（変更検知用）
  const [prevSearch, setPrevSearch] = useState<string | null>(null);
  const [prevCategory, setPrevCategory] = useState<string | null>(null);

  // 初回読み込み
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchProducts(1, true);
    }
  }, []);

  // フィルタ・ソート変更時
  useEffect(() => {
    if (initialLoadRef.current) {
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
    }
  }, [searchParams, sortBy]);

  const fetchProducts = async (pageNum: number, reset: boolean = false) => {
    console.log('fetchProducts called:', { pageNum, reset });

    if (reset) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const minPriceParam = searchParams.get("minPrice");
      const maxPriceParam = searchParams.get("maxPrice");
      const searchQuery = searchParams.get("search") || null;
      const categoryId = searchParams.get("category") || null;

      // ソート条件を分解
      const lastUnderscoreIndex = sortBy.lastIndexOf('_');
      const sortField = sortBy.substring(0, lastUnderscoreIndex);
      const sortDirection = sortBy.substring(lastUnderscoreIndex + 1) as 'asc' | 'desc';

      const filters = {
        search: searchQuery || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPriceParam ? parseInt(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam) : undefined,
        page: pageNum,
        limit: 12,
        sortBy: sortField as 'created_at' | 'price' | 'stock' | 'name',
        sortOrder: sortDirection,
      };

      const response = await productsApi.getAll(filters);

      if (reset) {
        setProducts(response.products);
      } else {
        setProducts(prev => [...prev, ...response.products]);
      }

      setTotal(response.total || 0);
      const totalPages = response.totalPages || 1;
      const hasMorePages = pageNum < totalPages;
      console.log('Page', pageNum, '/', totalPages, '- hasMore:', hasMorePages);
      setHasMore(hasMorePages);

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
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        const nextPage = page + 1;
        console.log('Loading page:', nextPage, 'hasMore:', hasMore);
        setPage(nextPage);
        fetchProducts(nextPage, false);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, isLoading, page]);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#111827" }}
              >
                {currentSearch ? `"${currentSearch}" の検索結果` : "商品一覧"}
              </Typography>

              {/* ソート */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>並び順</InputLabel>
                <Select
                  value={sortBy}
                  label="並び順"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="created_at_desc">新着順</MenuItem>
                  <MenuItem value="created_at_asc">古い順</MenuItem>
                  <MenuItem value="price_asc">価格: 安い順</MenuItem>
                  <MenuItem value="price_desc">価格: 高い順</MenuItem>
                  <MenuItem value="name_asc">商品名: A-Z</MenuItem>
                  <MenuItem value="name_desc">商品名: Z-A</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {!isLoading && products.length > 0 && (
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                全 {total} 件中 {products.length} 件を表示
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

              {/* 無限スクロール用の監視要素 */}
              {hasMore && (
                <div ref={loadMoreRef} style={{ height: '20px', margin: '20px 0' }} />
              )}

              {/* ローディング表示 */}
              {isLoadingMore && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography sx={{ color: "#6B7280" }}>読み込み中...</Typography>
                </Box>
              )}

              {/* デバッグ情報 */}
              {!hasMore && products.length > 0 && (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#9CA3AF", fontSize: 14 }}>
                    全ての商品を表示しました
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
