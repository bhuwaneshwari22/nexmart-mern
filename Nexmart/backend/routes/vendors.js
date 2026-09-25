const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { protect, isVendor, isAdmin } = require('../middleware/auth');

// Get all vendors (public)
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true })
      .populate('user', 'name email avatar')
      .sort({ totalSales: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get vendor by ID (public - storefront)
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email avatar');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const products = await Product.find({ vendor: vendor._id, isActive: true });
    res.json({ vendor, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my vendor profile
router.get('/me/profile', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate('user', 'name email');
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update vendor profile
router.put('/me/profile', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
