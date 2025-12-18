// File: routes/bookings.routes.js
import express from 'express';
import { getDb } from '../config/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ----------------- MIDDLEWARE: Verify JWT -----------------
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ----------------- CREATE BOOKING (User) -----------------
router.post('/', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = {
      ...req.body,
      userId: req.user.userId,
      status: 'Assigned', // initial status
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(booking);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Booking creation failed', error: error.message });
  }
});

// ----------------- UPDATE BOOKING STATUS (Decorator/Admin) -----------------
router.patch('/update-status/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const db = getDb();

    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking status updated', status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

// ----------------- GET BOOKINGS FOR CURRENT USER -----------------
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const bookings = await db.collection('bookings').find({ userId: req.user.userId }).toArray();

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
});

// ----------------- GET ALL BOOKINGS (Admin) -----------------
router.get('/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const db = getDb();
    const bookings = await db.collection('bookings').find().sort({ createdAt: -1 }).toArray();

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all bookings', error: error.message });
  }
});

export default router;
