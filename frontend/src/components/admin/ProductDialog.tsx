'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Product, Category } from '@/types/product';
import { adminApi, CreateProductData } from '@/lib/api/admin';
import { Button } from '@/components/common/Button';
import { ImageUpload } from './ImageUpload';
import { MultipleImageUpload } from './MultipleImageUpload';
import { useSnackbar } from '@/hooks/useSnackbar';

const productSchema = z.object({
  name: z.string().min(1, '商品名を入力してください'),
  description: z.string().min(1, '商品説明を入力してください'),
  price: z.number().min(0, '価格は0以上で入力してください'),
  stock: z.number().min(0, '在庫数は0以上で入力してください'),
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product;
  mode: 'create' | 'edit';
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  onSuccess,
  product,
  mode,
}) => {
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [imageFile, setImageFile] = useState<File | string | null>(
    product?.imageUrl || null
  );
  const [newImages, setNewImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      categoryId: product?.categoryId || '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      // Reset form when dialog opens
      if (product) {
        reset({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
        });
        setImageFile(product.imageUrl || null);
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          categoryId: '',
        });
        setImageFile(null);
      }
      setNewImages([]);
      setTabValue(0);
    }
  }, [open, product, reset]);

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showSnackbar('カテゴリの読み込みに失敗しました', 'error');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const productData: CreateProductData = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
      };

      if (imageFile instanceof File) {
        productData.image = imageFile;
      }

      let savedProduct: any;

      if (mode === 'create') {
        savedProduct = await adminApi.createProduct(productData);

        // Upload multiple images if any
        if (newImages.length > 0) {
          await adminApi.uploadProductImages(savedProduct.id, newImages);
        }

        showSnackbar('商品を作成しました', 'success');
      } else if (product) {
        savedProduct = await adminApi.updateProduct(product.id, productData);

        // Upload multiple images if any
        if (newImages.length > 0) {
          await adminApi.uploadProductImages(product.id, newImages);
        }

        showSnackbar('商品を更新しました', 'success');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Product save error:', error);
      showSnackbar(
        error.response?.data?.message || '商品の保存に失敗しました',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <SnackbarComponent />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#F9FAFB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {mode === 'create' ? '商品を追加' : '商品を編集'}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              disabled={isLoading}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="product tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="基本情報" />
          <Tab label="画像管理" />
        </Tabs>

        <DialogContent dividers>
          <form onSubmit={handleSubmit(onSubmit)} id="product-form">
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="商品名"
                  fullWidth
                  required
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
                />

                <TextField
                  label="商品説明"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={isLoading}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="価格"
                        type="number"
                        fullWidth
                        required
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: <Box sx={{ mr: 1 }}>¥</Box>,
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="stock"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="在庫数"
                        type="number"
                        fullWidth
                        required
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        error={!!errors.stock}
                        helperText={errors.stock?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.categoryId} disabled={isLoading}>
                      <InputLabel>カテゴリ</InputLabel>
                      <Select {...field} label="カテゴリ" required>
                        <MenuItem value="">
                          <em>選択してください</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <FormHelperText>{errors.categoryId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    メイン画像
                  </Typography>
                  <ImageUpload
                    value={imageFile}
                    onChange={setImageFile}
                    disabled={isLoading}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    追加画像
                  </Typography>
                  <MultipleImageUpload
                    productId={product?.id}
                    existingImages={product?.images || []}
                    newImages={newImages}
                    onNewImagesChange={setNewImages}
                    disabled={isLoading}
                  />
                </Box>
              </Box>
            </TabPanel>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#F9FAFB' }}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="product-form"
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : mode === 'create' ? '作成' : '更新'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
