import { Response } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { AuthRequest } from '../middleware/auth';
import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';
import { ProductImageModel } from '../models/ProductImage';
import { uploadFile } from '../services/uploadService';
import pool from '../config/database';

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Get all products (including inactive) - Admin only
 */
export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      categoryId,
      status,
      stockStatus,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    // Add category filter
    if (categoryId && categoryId !== 'all') {
      filters.categoryId = parseInt(categoryId as string);
    }

    // Add status filter
    if (status && status !== 'all') {
      filters.isActive = status === 'active';
    }

    // Add stock status filter
    if (stockStatus && stockStatus !== 'all') {
      filters.stockStatus = stockStatus as 'in_stock' | 'out_of_stock';
    }

    // Add search filter
    if (search && search !== '') {
      filters.search = search as string;
    }

    const { products, total } = await ProductModel.findAll(filters);

    // Fetch first image for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await ProductImageModel.getByProductId(product.id);
        const mainImage = images.find(img => img.is_main) || images[0] || null;

        return {
          ...product,
          imageUrl: mainImage?.image_url || null,
          images: images.map((img: any) => ({
            id: img.id,
            url: img.image_url,
            displayOrder: img.display_order,
            isMain: img.is_main,
          })),
        };
      })
    );

    const totalPages = Math.ceil(total / filters.limit);
    const hasMore = filters.page < totalPages;

    res.json({
      products: productsWithImages,
      total,
      page: filters.page,
      totalPages,
      hasMore,
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

/**
 * Create new product - Admin only
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    const product = await ProductModel.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

/**
 * Update product - Admin only
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, isActive } = req.body;

    const product = await ProductModel.update(parseInt(id), {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      isActive,
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

/**
 * Delete product - Admin only
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await ProductModel.delete(parseInt(id));

    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

/**
 * Upload product image - Admin only
 * This uploads a single image and sets it as the main image
 */
export const uploadProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const result = await uploadFile(req.file, 'products');

    // Get current max display order
    const currentImages = await ProductImageModel.getByProductId(productId);
    const maxOrder = currentImages.length > 0
      ? Math.max(...currentImages.map(img => img.display_order))
      : 0;

    // Unset current main image if exists
    if (currentImages.length > 0) {
      const currentMain = currentImages.find(img => img.is_main);
      if (currentMain) {
        await pool.query(
          'UPDATE product_images SET is_main = FALSE WHERE product_id = $1',
          [productId]
        );
      }
    }

    // Insert new image as main
    const imageResult = await pool.query(
      `INSERT INTO product_images (product_id, image_url, display_order, is_main)
       VALUES ($1, $2, $3, TRUE)
       RETURNING *`,
      [productId, result.url, maxOrder + 1]
    );

    res.json({
      message: 'Product image uploaded successfully',
      imageUrl: result.url,
      image: {
        id: imageResult.rows[0].id,
        imageUrl: imageResult.rows[0].image_url,
        displayOrder: imageResult.rows[0].display_order,
        isMain: imageResult.rows[0].is_main,
      },
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({ error: 'Failed to upload product image' });
  }
};

/**
 * Create new category - Admin only
 */
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const existingCategory = await CategoryModel.findByName(name);
    if (existingCategory) {
      res.status(400).json({ error: 'Category already exists' });
      return;
    }

    const category = await CategoryModel.create({ name, description });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

/**
 * Upload multiple product images - Admin only
 */
export const uploadProductImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check current image count
    const currentCount = await ProductImageModel.countByProductId(productId);
    const MAX_IMAGES = 10;

    if (currentCount + req.files.length > MAX_IMAGES) {
      res.status(400).json({
        error: `Maximum ${MAX_IMAGES} images allowed. Current: ${currentCount}, Attempting to add: ${req.files.length}`,
      });
      return;
    }

    // Upload all files
    const uploadPromises = req.files.map((file) => uploadFile(file, 'products'));
    const uploadResults = await Promise.all(uploadPromises);

    // Create image records
    const imageUrls = uploadResults.map((result) => result.url);
    const images = await ProductImageModel.createMany(productId, imageUrls);

    res.status(201).json({
      message: 'Product images uploaded successfully',
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.image_url,
        displayOrder: img.display_order,
      })),
    });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ error: 'Failed to upload product images' });
  }
};

/**
 * Delete a specific product image - Admin only
 */
export const deleteProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, imageId } = req.params;

    // Check if image exists and belongs to the product
    const image = await ProductImageModel.getById(parseInt(imageId));

    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    if (image.product_id !== parseInt(productId)) {
      res.status(403).json({ error: 'Image does not belong to this product' });
      return;
    }

    // Delete the file from filesystem if it exists
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filename = path.basename(image.image_url);
      const filePath = path.join(uploadsDir, 'products', filename);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('File deletion error (continuing):', fileError);
      // Continue even if file deletion fails
    }

    // Delete image record from database
    await ProductImageModel.delete(parseInt(imageId));

    // Reorder remaining images to maintain sequential order
    await ProductImageModel.reorderAfterDeletion(parseInt(productId));

    res.json({ message: 'Product image deleted successfully' });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ error: 'Failed to delete product image' });
  }
};

/**
 * Set main image for product - Admin only
 */
export const setMainProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, imageId } = req.params;

    // Check if image exists and belongs to the product
    const image = await ProductImageModel.getById(parseInt(imageId));

    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    if (image.product_id !== parseInt(productId)) {
      res.status(403).json({ error: 'Image does not belong to this product' });
      return;
    }

    // Set as main image
    await ProductModel.setMainImage(parseInt(productId), parseInt(imageId));

    res.json({ message: 'Main image updated successfully' });
  } catch (error) {
    console.error('Set main image error:', error);
    res.status(500).json({ error: 'Failed to set main image' });
  }
};

export const uploadMiddleware = upload.single('image');
export const uploadMultipleMiddleware = upload.array('images', 10); // Max 10 files
