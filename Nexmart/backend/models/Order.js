const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  subtotal: Number
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  paymentMethod: { type: String, default: 'stripe' },
  paymentId: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  totalAmount: { type: Number, required: true },
  commissionAmount: { type: Number, default: 0 },
  vendorPayoutAmount: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
