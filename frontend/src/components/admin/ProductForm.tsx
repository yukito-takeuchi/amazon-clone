'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { Product, Category } from '@/types/product';
import { adminApi, CreateProductData } from '@/lib/api/admin';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ImageUpload } from './ImageUpload';

const productSchema = z.object({
  name: z.string().min(1, '商品名を入力してください'),
  description: z.string().min(1, '商品説明を入力してください'),
  price: z.number().min(0, '価格は0以上で入力してください'),
  stock: z.number().min(0, '在庫数は0以上で入力してください'),
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  image: z.any().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, mode }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | string | null>(
    product?.imageUrl || null
  );

  const {
    register,
    handleSubmit,
    control,
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('カテゴリの読み込みに失敗しました');
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

      if (mode === 'create') {
        await adminApi.createProduct(productData);
        alert('商品を作成しました');
      } else if (product) {
        await adminApi.updateProduct(product.id, productData);
        alert('商品を更新しました');
      }

      router.push('/admin/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || '商品の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm('本当にこの商品を削除しますか？')) return;

    setIsDeleting(true);
    try {
      await adminApi.deleteProduct(product.id);
      alert('商品を削除しました');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      alert(error.response?.data?.message || '商品の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 商品情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">商品情報</h2>

        <div className="space-y-4">
          <Input
            label="商品名"
            {...register('name')}
            error={errors.name?.message}
            placeholder="商品名を入力"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={5}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="商品の詳細説明を入力"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                label="価格"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={errors.price?.message}
                placeholder="0"
                required
              />
            )}
          />

          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <Input
                label="在庫数"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={errors.stock?.message}
                placeholder="0"
                required
              />
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel id="category-label">カテゴリ *</InputLabel>
                <Select
                  {...field}
                  labelId="category-label"
                  label="カテゴリ *"
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9CA3AF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF9900',
                      borderWidth: 2,
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>カテゴリを選択</em>
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
        </div>
      </div>

      {/* 商品画像 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ImageUpload value={imageFile} onChange={setImageFile} />
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          キャンセル
        </Button>

        {mode === 'edit' && product && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            削除
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="ml-auto"
        >
          {mode === 'create' ? '作成' : '更新'}
        </Button>
      </div>
    </form>
  );
};
