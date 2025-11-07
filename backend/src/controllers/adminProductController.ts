import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth';
import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';
import { uploadFile } from '../services/uploadService';

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Get all products (including inactive) - Admin only
 */
export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;

    const filters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const { products, total } = await ProductModel.findAll(filters);

    res.json({
      products,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
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
 */
export const uploadProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const result = await uploadFile(req.file, 'products');

    const product = await ProductModel.update(parseInt(id), { imageUrl: result.url });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({
      message: 'Product image uploaded successfully',
      imageUrl: result.url,
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

export const uploadMiddleware = upload.single('image');
