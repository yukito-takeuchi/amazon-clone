'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cartApi } from '@/lib/api/cart';
import { addressesApi, CreateAddressData } from '@/lib/api/addresses';
import { stripeApi } from '@/lib/api/stripe';
import { Address } from '@/types/order';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSnackbar } from '@/hooks/useSnackbar';

const addressSchema = z.object({
  fullName: z.string().min(1, '名前を入力してください'),
  phoneNumber: z.string().min(10, '電話番号を入力してください'),
  postalCode: z.string().regex(/^\d{7}$/, '7桁の郵便番号を入力してください'),
  prefecture: z.string().min(1, '都道府県を入力してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  addressLine1: z.string().min(1, '番地を入力してください'),
  addressLine2: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cartData, addressesData] = await Promise.all([
        cartApi.getCart(),
        addressesApi.getAll(),
      ]);

      setCart(cartData);
      setAddresses(addressesData);

      // デフォルト配送先を自動選択
      const defaultAddress = addressesData.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      const newAddress = await addressesApi.create(data);
      setAddresses([...addresses, newAddress]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      reset();
    } catch (error: any) {
      console.error('Failed to add address:', error);
      alert(error.response?.data?.message || '配送先の追加に失敗しました');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showSnackbar('配送先を選択してください', 'warning');
      return;
    }

    if (!cart || cart.items.length === 0) {
      showSnackbar('カートが空です', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create Stripe Checkout Session
      const { url } = await stripeApi.createCheckoutSession({
        addressId: parseInt(selectedAddressId),
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      showSnackbar(
        error.response?.data?.error || 'チェックアウトに失敗しました',
        'error'
      );
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">注文手続き</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">カートが空です</p>
            <Button variant="primary" onClick={() => router.push('/products')}>
              商品を見る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SnackbarComponent />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">お支払い手続き</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">配送先</h2>

              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border rounded cursor-pointer transition ${
                        selectedAddressId === address.id
                          ? 'border-[#FF9900] bg-orange-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mr-3"
                      />
                      <span className="font-semibold">{address.fullName}</span>
                      {address.isDefault && (
                        <span className="ml-2 text-xs bg-[#FF9900] text-white px-2 py-1 rounded">
                          デフォルト
                        </span>
                      )}
                      <div className="ml-6 text-sm text-gray-600">
                        <p>〒{address.postalCode}</p>
                        <p>
                          {address.prefecture} {address.city} {address.addressLine1}
                        </p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>電話: {address.phoneNumber}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showAddressForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full"
                >
                  + 新しい配送先を追加
                </Button>
              ) : (
                <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4">
                  <Input
                    label="氏名"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                    placeholder="山田 太郎"
                  />

                  <Input
                    label="電話番号"
                    {...register('phoneNumber')}
                    error={errors.phoneNumber?.message}
                    placeholder="09012345678"
                  />

                  <Input
                    label="郵便番号（ハイフンなし）"
                    {...register('postalCode')}
                    error={errors.postalCode?.message}
                    placeholder="1234567"
                  />

                  <Input
                    label="都道府県"
                    {...register('prefecture')}
                    error={errors.prefecture?.message}
                    placeholder="東京都"
                  />

                  <Input
                    label="市区町村"
                    {...register('city')}
                    error={errors.city?.message}
                    placeholder="渋谷区"
                  />

                  <Input
                    label="番地"
                    {...register('addressLine1')}
                    error={errors.addressLine1?.message}
                    placeholder="1-2-3"
                  />

                  <Input
                    label="建物名・部屋番号（任意）"
                    {...register('addressLine2')}
                    error={errors.addressLine2?.message}
                    placeholder="ABCマンション 101号室"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('isDefault')}
                      id="isDefault"
                      className="rounded"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700">
                      デフォルトの配送先として設定
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" className="flex-1">
                      配送先を追加
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">注文内容</h2>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-gray-600">
                        数量: {item.quantity} × ¥{item.product.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ¥{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">注文概要</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>商品数</span>
                  <span>{cart.totalItems}点</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>商品合計</span>
                  <span>¥{cart.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>配送料</span>
                  <span>無料</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>合計</span>
                  <span>¥{cart.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                disabled={!selectedAddressId || isSubmitting}
                className="w-full"
              >
                お支払いへ進む
              </Button>

              <p className="text-xs text-gray-600 mt-4 text-center">
                Stripeの安全な決済画面に移動します
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
