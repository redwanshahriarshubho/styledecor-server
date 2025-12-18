import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const db = getDb();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { name, email, password: hashedPassword, photoURL: photoURL || '', role: 'user', status: 'active', createdAt: new Date(), updatedAt: new Date() };

    const result = await db.collection('users').insertOne(user);
    const token = jwt.sign({ userId: result.insertedId.toString(), email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    delete user.password;
    user._id = result.insertedId;

    res.status(201).json({ success: true, token, user: { userId: result.insertedId.toString(), name: user.name, email: user.email, photoURL: user.photoURL, role: user.role, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account is disabled' });

    const token = jwt.sign({ userId: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    delete user.password;

    res.json({ success: true, token, user: { userId: user._id.toString(), name: user.name, email: user.email, photoURL: user.photoURL, role: user.role, status: user.status, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user (for token verification)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    delete user.password;
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

export default router;