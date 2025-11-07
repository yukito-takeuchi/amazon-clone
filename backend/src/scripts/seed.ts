import pool from '../config/database';
import { CategoryModel } from '../models/Category';
import { ProductModel } from '../models/Product';
import { UserModel } from '../models/User';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await UserModel.create({
      firebaseUid: 'admin-seed-uid',
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true,
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create test user
    console.log('Creating test user...');
    const testUser = await UserModel.create({
      firebaseUid: 'test-user-uid',
      email: 'user@example.com',
      name: 'Test User',
      isAdmin: false,
    });
    console.log('✅ Test user created:', testUser.email);

    // Create categories
    console.log('Creating categories...');
    const electronics = await CategoryModel.create({
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    });

    const clothing = await CategoryModel.create({
      name: 'Clothing',
      description: 'Fashion and apparel',
    });

    const books = await CategoryModel.create({
      name: 'Books',
      description: 'Books and publications',
    });

    const home = await CategoryModel.create({
      name: 'Home & Kitchen',
      description: 'Home and kitchen items',
    });

    console.log('✅ Categories created');

    // Create products
    console.log('Creating products...');

    // Electronics products
    await ProductModel.create({
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 89.99,
      stock: 50,
      categoryId: electronics.id,
    });

    await ProductModel.create({
      name: 'Smartphone',
      description: 'Latest model smartphone with advanced features',
      price: 699.99,
      stock: 30,
      categoryId: electronics.id,
    });

    await ProductModel.create({
      name: 'Laptop',
      description: 'Powerful laptop for work and entertainment',
      price: 1299.99,
      stock: 20,
      categoryId: electronics.id,
    });

    // Clothing products
    await ProductModel.create({
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 19.99,
      stock: 100,
      categoryId: clothing.id,
    });

    await ProductModel.create({
      name: 'Jeans',
      description: 'Classic blue jeans',
      price: 49.99,
      stock: 75,
      categoryId: clothing.id,
    });

    await ProductModel.create({
      name: 'Sneakers',
      description: 'Stylish and comfortable sneakers',
      price: 79.99,
      stock: 60,
      categoryId: clothing.id,
    });

    // Books products
    await ProductModel.create({
      name: 'JavaScript: The Good Parts',
      description: 'Essential reading for JavaScript developers',
      price: 29.99,
      stock: 40,
      categoryId: books.id,
    });

    await ProductModel.create({
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship',
      price: 39.99,
      stock: 35,
      categoryId: books.id,
    });

    // Home products
    await ProductModel.create({
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with timer',
      price: 59.99,
      stock: 45,
      categoryId: home.id,
    });

    await ProductModel.create({
      name: 'Blender',
      description: 'High-power blender for smoothies',
      price: 39.99,
      stock: 55,
      categoryId: home.id,
    });

    console.log('✅ Products created');

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
