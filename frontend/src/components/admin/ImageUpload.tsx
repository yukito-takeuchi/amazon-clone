'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX } from 'react-icons/fi';

interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, error }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (typeof value === 'string' && value) {
      // 既存の画像URL
      setPreview(`${process.env.NEXT_PUBLIC_IMAGE_URL}/${value}`);
    } else if (value instanceof File) {
      // 新しくアップロードされたファイル
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    // ファイル形式チェック
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert('JPG、PNG、WEBP形式の画像のみアップロード可能です');
      return;
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">商品画像</label>

      {preview ? (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
          <Image
            src={preview}
            alt="商品画像プレビュー"
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
          >
            <FiX />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition flex flex-col items-center justify-center bg-gray-50"
        >
          <FiUpload className="text-4xl text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">画像をアップロード</span>
          <span className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (最大5MB)</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
