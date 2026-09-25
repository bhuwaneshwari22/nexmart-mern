const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Commission = require('../models/Commission');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, isVendor, isAdmin } = require('../middleware/auth');

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE) || 0.10;

// Place order
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentId, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product items.vendor');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;
      return {
        product: item.product._id,
        vendor: item.vendor._id,
        name: item.product.name,
        image: item.product.images[0] || '',
        price: item.price,
        quantity: item.quantity,
        subtotal
      };
    });

    const commissionAmount = totalAmount * COMMISSION_RATE;
    const vendorPayoutAmount = totalAmount - commissionAmount;

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentId: paymentId || '',
      paymentStatus: paymentId ? 'paid' : 'pending',
      totalAmount,
      commissionAmount,
      vendorPayoutAmount,
      notes
    });

    // Create commission records per vendor
    const vendorGroups = {};
    for (const item of orderItems) {
      const vid = item.vendor.toString();
      if (!vendorGroups[vid]) vendorGroups[vid] = 0;
      vendorGroups[vid] += item.subtotal;
    }

    for (const [vendorId, amount] of Object.entries(vendorGroups)) {
      const commission = amount * COMMISSION_RATE;
      await Commission.create({
        order: order._id,
        vendor: vendorId,
        orderAmount: amount,
        commissionRate: COMMISSION_RATE,
        commissionAmount: commission,
        vendorPayout: amount - commission
      });

      // Update vendor stats
      await Vendor.findByIdAndUpdate(vendorId, {
        $inc: {
          totalSales: 1,
          totalRevenue: amount,
          totalCommissionPaid: commission,
          balance: amount - commission
        }
      });
    }

    // Update product sold count
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { sold: item.quantity, stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get buyer's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name images')
      .populate('items.vendor', 'shopName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get vendor's orders
router.get('/vendor', protect, isVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const orders = await Order.find({ 'items.vendor': vendor._id })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (vendor)
router.put('/:id/status', protect, isVendor, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status, updatedAt: Date.now() }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email')
      .populate('items.vendor', 'shopName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images')
      .populate('items.vendor', 'shopName');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
