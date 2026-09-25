const express = require('express');
const router = express.Router();
const Commission = require('../models/Commission');
const Vendor = require('../models/Vendor');
const { protect, isVendor, isAdmin } = require('../middleware/auth');

// Get vendor's commissions
router.get('/vendor', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const commissions = await Commission.find({ vendor: vendor._id })
      .populate('order', 'createdAt totalAmount orderStatus')
      .sort({ createdAt: -1 });
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all commissions (admin)
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const commissions = await Commission.find()
      .populate('vendor', 'shopName')
      .populate('order', 'createdAt totalAmount')
      .sort({ createdAt: -1 });
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get commission summary (admin)
router.get('/admin/summary', protect, isAdmin, async (req, res) => {
  try {
    const summary = await Commission.aggregate([
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commissionAmount' },
          totalPayout: { $sum: '$vendorPayout' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    res.json(summary[0] || { totalCommission: 0, totalPayout: 0, totalOrders: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
