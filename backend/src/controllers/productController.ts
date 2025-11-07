import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';

/**
 * Get all products with filters
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const filters = {
      categoryId: category ? parseInt(category as string) : undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      search: search as string,
      isActive: true, // Only show active products to public
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
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(parseInt(id));

    if (!product || !product.is_active) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

/**
 * Get all categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.findAll();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};
