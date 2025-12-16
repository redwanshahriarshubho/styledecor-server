// ===================================================================
// Payment Routes - Complete File
// ===================================================================
// File Location: styledecor-server/routes/paymentRoutes.js
// ===================================================================

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// ===================================================================
// CREATE PAYMENT INTENT
// ===================================================================
// POST /api/payments/create-payment-intent
// Description: Create a Stripe payment intent for a booking
// Access: Private (requires authentication)
router.post('/create-payment-intent', verifyToken, async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount' 
      });
    }

    // Validate booking ID
    if (!bookingId) {
      return res.status(400).json({ 
        success: false,
        message: 'Booking ID is required' 
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert BDT to paisa (smallest currency unit)
      currency: 'bdt',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId,
        userId: req.user.userId,
        userEmail: req.user.email
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
});

// ===================================================================
// CONFIRM PAYMENT
// ===================================================================
// POST /api/payments/confirm-payment
// Description: Confirm payment and update booking status
// Access: Private (requires authentication)
router.post('/confirm-payment', verifyToken, async (req, res) => {
  try {
    const { bookingId, paymentIntentId, amount } = req.body;
    const db = getDb();

    // Validate input
    if (!bookingId || !paymentIntentId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Update booking payment status
    const bookingUpdate = await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentStatus: 'paid',
          paymentIntentId: paymentIntentId,
          status: 'confirmed',
          updatedAt: new Date()
        }
      }
    );

    if (bookingUpdate.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Create payment record
    const payment = {
      userId: new ObjectId(req.user.userId),
      bookingId: new ObjectId(bookingId),
      amount: amount,
      transactionId: paymentIntentId,
      status: 'completed',
      paymentMethod: 'stripe',
      userEmail: req.user.email,
      createdAt: new Date()
    };

    await db.collection('payments').insertOne(payment);

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        bookingId,
        paymentIntentId,
        amount
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
});

// ===================================================================
// GET PAYMENT HISTORY (USER)
// ===================================================================
// GET /api/payments/history
// Description: Get payment history for logged-in user
// Access: Private (requires authentication)
router.get('/history', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    
    const payments = await db
      .collection('payments')
      .find({ userId: new ObjectId(req.user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message 
    });
  }
});

// ===================================================================
// GET ALL PAYMENTS (ADMIN)
// ===================================================================
// GET /api/payments/all
// Description: Get all payments (admin only)
// Access: Private (Admin only)
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const db = getDb();
    
    const payments = await db
      .collection('payments')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);

    res.json({
      success: true,
      data: payments,
      totalRevenue: totalRevenue,
      count: payments.length
    });

  } catch (error) {
    console.error('All payments fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payments',
      error: error.message 
    });
  }
});

// ===================================================================
// GET PAYMENT BY ID
// ===================================================================
// GET /api/payments/:id
// Description: Get single payment details
// Access: Private (requires authentication)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const payment = await db.collection('payments').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    // Check if user owns this payment or is admin
    if (payment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment',
      error: error.message 
    });
  }
});

module.exports = router;