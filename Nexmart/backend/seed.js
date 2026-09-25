const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/multivendor_marketplace';

const products = [
  { name: 'Premium Wireless Headphones', description: 'Industry-leading noise cancellation with 30-hour battery life. Crystal clear audio and premium comfort.', price: 8999, discountPrice: 6999, category: 'Electronics', stock: 50, images: ['https://picsum.photos/seed/headphones/600/600'], tags: ['wireless', 'audio', 'bluetooth'] },
  { name: 'Smart LED TV 43"', description: '4K Ultra HD Smart TV with HDR10, built-in WiFi, and access to all streaming platforms.', price: 34999, discountPrice: 28999, category: 'Electronics', stock: 20, images: ['https://picsum.photos/seed/tv43/600/600'], tags: ['tv', '4k', 'smart'] },
  { name: 'Mechanical Keyboard RGB', description: 'Tactile mechanical switches with customizable RGB lighting. Perfect for gaming and typing.', price: 4999, discountPrice: 3599, category: 'Electronics', stock: 75, images: ['https://picsum.photos/seed/keyboard/600/600'], tags: ['keyboard', 'gaming', 'rgb'] },
  { name: 'Designer Kurta Set', description: 'Handcrafted pure cotton kurta with intricate embroidery. Perfect for festivals and occasions.', price: 2499, discountPrice: 1799, category: 'Fashion', stock: 100, images: ['https://picsum.photos/seed/kurta/600/600'], tags: ['ethnic', 'cotton', 'festive'] },
  { name: 'Running Shoes Pro', description: 'Lightweight mesh upper with advanced cushioning technology. Designed for long-distance running.', price: 5999, discountPrice: 4499, category: 'Sports', stock: 60, images: ['https://picsum.photos/seed/shoes/600/600'], tags: ['running', 'sports', 'fitness'] },
  { name: 'Yoga Mat Premium', description: 'Non-slip eco-friendly yoga mat with alignment lines. 6mm thickness for joint protection.', price: 1299, discountPrice: 999, category: 'Sports', stock: 120, images: ['https://picsum.photos/seed/yoga/600/600'], tags: ['yoga', 'fitness', 'eco'] },
  { name: 'Stainless Steel Cookware Set', description: 'Professional grade 5-piece cookware set with tri-ply construction for even heat distribution.', price: 7499, discountPrice: 5999, category: 'Home & Living', stock: 30, images: ['https://picsum.photos/seed/cookware/600/600'], tags: ['kitchen', 'cooking', 'steel'] },
  { name: 'Aromatherapy Diffuser', description: 'Ultrasonic essential oil diffuser with 7 LED colors and auto-shutoff for home relaxation.', price: 1899, discountPrice: 1399, category: 'Home & Living', stock: 80, images: ['https://picsum.photos/seed/diffuser/600/600'], tags: ['aromatherapy', 'relaxation', 'home'] },
  { name: 'The Psychology of Money', description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. Bestseller worldwide.', price: 499, discountPrice: 349, category: 'Books', stock: 200, images: ['https://picsum.photos/seed/book1/600/600'], tags: ['finance', 'self-help', 'bestseller'] },
  { name: 'Vitamin C Serum', description: '20% Vitamin C with hyaluronic acid and niacinamide. Brightens skin and reduces dark spots.', price: 899, discountPrice: 649, category: 'Beauty', stock: 150, images: ['https://picsum.photos/seed/serum/600/600'], tags: ['skincare', 'vitamin-c', 'brightening'] },
  { name: 'Laptop Backpack 30L', description: 'Water-resistant backpack with USB charging port, laptop compartment up to 17 inch.', price: 2199, discountPrice: 1699, category: 'Electronics', stock: 90, images: ['https://picsum.photos/seed/backpack/600/600'], tags: ['laptop', 'bag', 'travel'] },
  { name: 'Linen Bedsheet Set', description: 'Pure cotton 400 thread count bedsheet with 2 pillow covers. Hypoallergenic and soft.', price: 2999, discountPrice: 2299, category: 'Home & Living', stock: 45, images: ['https://picsum.photos/seed/bedsheet/600/600'], tags: ['bedding', 'cotton', 'home'] },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([User.deleteMany(), Vendor.deleteMany(), Product.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create({ name: 'Admin User', email: 'admin@nexmart.com', password: 'admin123', role: 'admin' });
    console.log('👤 Admin created: admin@nexmart.com / admin123');

    // Create vendors
    const vendorData = [
      { name: 'TechZone India', email: 'vendor@nexmart.com', shopName: 'TechZone India', shopDescription: 'Your one-stop shop for all electronics and gadgets at the best prices.', category: 'Electronics', password: 'vendor123' },
      { name: 'Fashion Hub', email: 'fashion@nexmart.com', shopName: 'Fashion Hub', shopDescription: 'Curated ethnic and western wear for modern Indians.', category: 'Fashion', password: 'vendor123' },
      { name: 'SportsPro Store', email: 'sports@nexmart.com', shopName: 'SportsPro Store', shopDescription: 'Professional sports equipment and fitness gear.', category: 'Sports', password: 'vendor123' },
    ];

    const createdVendors = [];
    for (const vd of vendorData) {
      const vUser = await User.create({ name: vd.name, email: vd.email, password: vd.password, role: 'vendor' });
      const vendor = await Vendor.create({ user: vUser._id, shopName: vd.shopName, shopDescription: vd.shopDescription, category: vd.category, isVerified: true, rating: 4.2 + Math.random() * 0.7 });
      createdVendors.push(vendor);
      console.log(`🏪 Vendor created: ${vd.email} / ${vd.password}`);
    }

    // Create buyer
    await User.create({ name: 'Test Buyer', email: 'buyer@nexmart.com', password: 'buyer123', role: 'buyer' });
    console.log('🛒 Buyer created: buyer@nexmart.com / buyer123');

    // Assign products to vendors
    const vendorAssign = [0, 0, 0, 1, 2, 2, 0, 2, 1, 1, 0, 0];
    for (let i = 0; i < products.length; i++) {
      await Product.create({ ...products[i], vendor: createdVendors[vendorAssign[i]]._id });
    }
    console.log(`📦 ${products.length} products created`);

    console.log('\n✅ ===== SEED COMPLETE =====');
    console.log('🚀 Demo Accounts:');
    console.log('   Admin:  admin@nexmart.com  / admin123');
    console.log('   Vendor: vendor@nexmart.com / vendor123');
    console.log('   Buyer:  buyer@nexmart.com  / buyer123');
    console.log('===========================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
