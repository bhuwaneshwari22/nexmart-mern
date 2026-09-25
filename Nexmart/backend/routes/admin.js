const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Commission = require('../models/Commission');
const Dispute = require('../models/Dispute');
const { protect, isAdmin } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', protect, isAdmin, async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalProducts, totalOrders, commissionData, openDisputes] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      Vendor.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Commission.aggregate([{ $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
      Dispute.countDocuments({ status: { $in: ['open', 'in_review'] } })
    ]);

    const recentOrders = await Order.find()
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalCommission: commissionData[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        openDisputes
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all vendors
router.get('/vendors', protect, isAdmin, async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify vendor
router.put('/vendors/:id/verify', protect, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle vendor active status
router.put('/vendors/:id/toggle', protect, isAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    vendor.isActive = !vendor.isActive;
    await vendor.save();
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
