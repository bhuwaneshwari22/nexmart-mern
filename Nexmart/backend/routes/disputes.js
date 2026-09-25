const express = require('express');
const router = express.Router();
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const { protect, isAdmin } = require('../middleware/auth');

// Raise dispute (buyer)
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, subject, description } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your order' });
    }

    const vendorId = order.items[0].vendor;
    const dispute = await Dispute.create({
      order: orderId,
      buyer: req.user._id,
      vendor: vendorId,
      subject,
      description,
      messages: [{ sender: req.user._id, senderRole: 'buyer', message: description }]
    });
    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get buyer's disputes
router.get('/my', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({ buyer: req.user._id })
      .populate('order', 'totalAmount createdAt')
      .populate('vendor', 'shopName')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all disputes (admin)
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('buyer', 'name email')
      .populate('vendor', 'shopName')
      .populate('order', 'totalAmount createdAt')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add message to dispute
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    dispute.messages.push({ sender: req.user._id, senderRole: req.user.role, message });
    if (dispute.status === 'open') dispute.status = 'in_review';
    await dispute.save();
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resolve dispute (admin)
router.put('/:id/resolve', protect, isAdmin, async (req, res) => {
  try {
    const { resolution } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolution, resolvedBy: req.user._id, resolvedAt: Date.now() },
      { new: true }
    );
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
