const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { protect, isVendor } = require('../middleware/auth');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, vendor, page = 1, limit = 12 } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    if (vendor) query.vendor = vendor;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('vendor', 'shopName shopLogo rating')
      .sort(sortObj)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'shopName shopLogo shopDescription rating totalSales isVerified');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (vendor only)
router.post('/', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const product = await Product.create({ ...req.body, vendor: vendor._id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product (vendor only)
router.put('/:id', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (vendor only)
router.delete('/:id', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    await Product.findOneAndDelete({ _id: req.params.id, vendor: vendor._id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    product.totalReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    res.json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
