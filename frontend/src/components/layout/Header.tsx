"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  TextField,
  IconButton,
  Badge,
  Button as MuiButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
    <AppBar position="sticky" sx={{ bgcolor: "#131921", boxShadow: "none" }}>
      <Toolbar sx={{ gap: 1.5, py: 1, minHeight: "60px !important" }}>
        {/* 左セクション */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {/* ロゴ */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                border: "1px solid transparent",
                borderRadius: "2px",
                transition: "border-color 0.15s",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <Image
                src="/amazon-com-light.svg"
                alt="Amazon"
                width={100}
                height={30}
                priority
                className="h-8 w-auto"
              />
              <Typography
                component="span"
                sx={{ fontSize: 12, color: "white", ml: 0.5 }}
              >
                .jp
              </Typography>
            </Box>
          </Link>

          {/* お届け先 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              gap: 0.5,
              p: 1,
              cursor: "pointer",
              border: "1px solid transparent",
              borderRadius: "2px",
              transition: "border-color 0.15s",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <LocationOnIcon sx={{ fontSize: 20, color: "white" }} />
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#CCCCCC",
                  lineHeight: 1.2,
                }}
              >
                お届け先
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                日本
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 中央セクション - 検索バー */}
        <Box
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            flex: 1,
            maxWidth: 900,
            height: 40,
          }}
        >
          {/* カテゴリドロップダウン */}
          <MuiButton
            variant="contained"
            sx={{
              bgcolor: "#E6E6E6",
              color: "#333",
              minWidth: 50,
              borderRadius: "4px 0 0 4px",
              textTransform: "none",
              fontSize: 14,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#D5D5D5",
                boxShadow: "none",
              },
            }}
            endIcon={<ArrowDropDownIcon />}
          >
            すべて
          </MuiButton>

          {/* 検索入力 */}
          <TextField
            variant="outlined"
            placeholder="検索 Amazon.jp"
            size="small"
            sx={{
              flex: 1,
              bgcolor: "white",
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: 0,
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "transparent",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF9900",
                  borderWidth: 2,
                },
              },
              "& .MuiOutlinedInput-input": {
                fontSize: 14,
                padding: "8px 12px",
              },
            }}
          />

          {/* 検索ボタン */}
          <IconButton
            type="submit"
            sx={{
              bgcolor: "#FEBD69",
              borderRadius: "0 4px 4px 0",
              width: 45,
              height: 40,
              "&:hover": {
                bgcolor: "#F3A847",
              },
            }}
          >
            <SearchIcon sx={{ color: "#131921", fontSize: 24 }} />
          </IconButton>
        </Box>

        {/* 右セクション */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {/* アカウント&リスト */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 1,
              cursor: "pointer",
              border: "1px solid transparent",
              borderRadius: "2px",
              transition: "border-color 0.15s",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                color: "#CCCCCC",
                lineHeight: 1.2,
              }}
            >
              {isAuthenticated ? `こんにちは, ${firstName}` : "ログイン"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                アカウント&リスト
              </Typography>
              <ArrowDropDownIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
          </Box>

          {/* 返品もこちら 注文履歴 */}
          <Link href="/orders" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                p: 1,
                border: "1px solid transparent",
                borderRadius: "2px",
                transition: "border-color 0.15s",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#CCCCCC",
                  lineHeight: 1.2,
                }}
              >
                返品もこちら
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                注文履歴
              </Typography>
            </Box>
          </Link>

          {/* カート */}
          <Link href="/cart" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 1,
                border: "1px solid transparent",
                borderRadius: "2px",
                transition: "border-color 0.15s",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <Badge
                badgeContent={cartCount}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#F08804",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    height: 20,
                    minWidth: 20,
                    borderRadius: "10px",
                    top: -4,
                    right: 4,
                  },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 28, color: "white" }} />
              </Badge>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  mt: 0.5,
                }}
              >
                カート
              </Typography>
            </Box>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
