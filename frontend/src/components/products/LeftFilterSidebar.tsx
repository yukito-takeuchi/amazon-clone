'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Divider, FormControlLabel, Checkbox, Slider, Button } from '@mui/material';

interface LeftFilterSidebarProps {
  onFilterChange?: (filters: any) => void;
  minProductPrice?: number;
  maxProductPrice?: number;
}

export const LeftFilterSidebar: React.FC<LeftFilterSidebarProps> = ({
  onFilterChange,
  minProductPrice = 0,
  maxProductPrice = 100000,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // スライダーの最小・最大値を商品価格に基づいて設定
  const sliderMin = Math.floor(minProductPrice / 1000) * 1000;
  const sliderMax = Math.ceil(maxProductPrice / 1000) * 1000;

  const [priceRange, setPriceRange] = React.useState<number[]>([sliderMin, sliderMax]);
  const [inStockOnly, setInStockOnly] = React.useState(false);

  // URLパラメータから初期値を設定
  React.useEffect(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : sliderMin,
        maxPrice ? parseInt(maxPrice) : sliderMax,
      ]);
    } else {
      setPriceRange([sliderMin, sliderMax]);
    }
  }, [searchParams, sliderMin, sliderMax]);

  // 価格範囲のリンクを生成
  const generatePriceRanges = () => {
    if (minProductPrice === maxProductPrice || maxProductPrice === 0) {
      return [];
    }

    const ranges: { label: string; min: number; max?: number }[] = [];
    const priceGap = maxProductPrice - minProductPrice;
    const step = Math.ceil(priceGap / 4 / 1000) * 1000; // 4分割して1000円単位に丸める

    let currentMin = Math.floor(minProductPrice / 1000) * 1000;

    // 最初の3つの範囲
    for (let i = 0; i < 3; i++) {
      const rangeMax = currentMin + step;
      if (rangeMax < maxProductPrice) {
        ranges.push({
          label: `¥${currentMin.toLocaleString()}～¥${rangeMax.toLocaleString()}`,
          min: currentMin,
          max: rangeMax,
        });
        currentMin = rangeMax;
      }
    }

    // 最後の範囲（〜以上）
    if (currentMin < maxProductPrice) {
      ranges.push({
        label: `¥${currentMin.toLocaleString()}以上`,
        min: currentMin,
      });
    }

    return ranges;
  };

  const priceRanges = generatePriceRanges();

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    // 価格範囲がデフォルトでない場合のみパラメータを設定
    if (priceRange[0] > sliderMin) {
      params.set('minPrice', priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }

    if (priceRange[1] < sliderMax) {
      params.set('maxPrice', priceRange[1].toString());
    } else {
      params.delete('maxPrice');
    }

    // ページを1にリセット
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  const handlePriceRangeClick = (min: number, max?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('minPrice', min.toString());
    if (max) {
      params.set('maxPrice', max.toString());
    } else {
      params.delete('maxPrice');
    }

    // ページを1にリセット
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  const categories = [
    { id: '1', name: 'エレクトロニクス' },
    { id: '2', name: 'ファッション' },
    { id: '3', name: 'ホーム&キッチン' },
    { id: '4', name: 'スポーツ&アウトドア' },
    { id: '5', name: '本・雑誌' },
  ];

  return (
    <Box
      sx={{
        width: '16%',
        minWidth: 200,
        bgcolor: 'white',
        borderRight: '1px solid #E5E7EB',
        p: 2,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        position: 'sticky',
        top: 60,
      }}
    >
      {/* カテゴリフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1.5 }}>
          カテゴリー
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {categories.map((category) => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  size="small"
                  sx={{
                    color: '#9CA3AF',
                    '&.Mui-checked': { color: '#FF9900' },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 13, color: '#374151' }}>
                  {category.name}
                </Typography>
              }
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 価格フィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1.5 }}>
          価格
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={sliderMin}
            max={sliderMax}
            step={1000}
            sx={{
              color: '#FF9900',
              '& .MuiSlider-thumb': {
                bgcolor: '#FF9900',
              },
              '& .MuiSlider-track': {
                bgcolor: '#FF9900',
              },
              '& .MuiSlider-rail': {
                bgcolor: '#E5E7EB',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 2 }}>
            <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
              ¥{priceRange[0].toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
              ¥{priceRange[1].toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handlePriceSearch}
            sx={{
              bgcolor: '#FF9900',
              color: 'white',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 600,
              py: 0.75,
              '&:hover': {
                bgcolor: '#F08804',
              },
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            絞り込む
          </Button>

          {/* 価格範囲リンク */}
          {priceRanges.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {priceRanges.map((range, index) => (
                  <Typography
                    key={index}
                    onClick={() => handlePriceRangeClick(range.min, range.max)}
                    sx={{
                      fontSize: 13,
                      color: '#0066C0',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#C45500',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {range.label}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 在庫状況フィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1.5 }}>
          在庫状況
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              sx={{
                color: '#9CA3AF',
                '&.Mui-checked': { color: '#FF9900' },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: '#374151' }}>
              在庫あり商品のみ
            </Typography>
          }
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 評価フィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1.5 }}>
          カスタマーレビュー
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {[4, 3, 2, 1].map((rating) => (
            <FormControlLabel
              key={rating}
              control={
                <Checkbox
                  size="small"
                  sx={{
                    color: '#9CA3AF',
                    '&.Mui-checked': { color: '#FF9900' },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: '#374151' }}>
                    ★ {rating} 以上
                  </Typography>
                </Box>
              }
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* プライム配送 */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1.5 }}>
          配送オプション
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: '#9CA3AF',
                '&.Mui-checked': { color: '#FF9900' },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: '#0066C0' }}>
              Prime 配送対象
            </Typography>
          }
        />
      </Box>
    </Box>
  );
};
