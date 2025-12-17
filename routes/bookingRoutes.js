import express from 'express';
import { getDb } from '../config/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
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

// Create booking (user only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = { ...req.body, userId: req.user.userId, status: 'Assigned', createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('bookings').insertOne(booking);
    res.json({ success: true, bookingId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
});

// Update booking status (decorator/admin)
router.patch('/update-status/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const db = getDb();
    await db.collection('bookings').updateOne({ _id: new ObjectId(bookingId) }, { $set: { status, updatedAt: new Date() } });
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Get bookings for user
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const bookings = await db.collection('bookings').find({ userId: req.user.userId }).toArray();
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
});

export default router;
