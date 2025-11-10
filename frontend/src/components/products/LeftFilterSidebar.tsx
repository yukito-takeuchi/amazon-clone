'use client';

import React from 'react';
import { Box, Typography, Divider, FormControlLabel, Checkbox, Slider } from '@mui/material';

interface LeftFilterSidebarProps {
  onFilterChange?: (filters: any) => void;
}

export const LeftFilterSidebar: React.FC<LeftFilterSidebarProps> = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = React.useState<number[]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = React.useState(false);

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
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
            min={0}
            max={100000}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
              ¥{priceRange[0].toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
              ¥{priceRange[1].toLocaleString()}
            </Typography>
          </Box>
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
