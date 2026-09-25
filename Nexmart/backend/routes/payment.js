const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');

// Create payment intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to paise/cents
      currency: 'inr',
      automatic_payment_methods: { enabled: true }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Stripe Connect account for vendor
router.post('/connect/account', protect, async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'IN',
      email: req.user.email,
      capabilities: { transfers: { requested: true } }
    });
    res.json({ accountId: account.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
