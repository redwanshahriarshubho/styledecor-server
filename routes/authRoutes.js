import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const db = getDB();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      photoURL: photoURL || '',
      role: 'user',
      createdAt: new Date(),
      status: 'active'
    };

    const result = await db.collection('users').insertOne(newUser);

    const token = jwt.sign(
      { 
        userId: result.insertedId, 
        email, 
        role: 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: result.insertedId,
        name,
        email,
        photoURL: photoURL || '',
        role: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is disabled. Contact admin.' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

router.post('/social-login', async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;
    const db = getDB();

    let user = await db.collection('users').findOne({ email });

    if (!user) {
      const newUser = {
        name,
        email,
        photoURL,
        role: 'user',
        createdAt: new Date(),
        status: 'active',
        authProvider: 'google'
      };

      const result = await db.collection('users').insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Social login failed', 
      error: error.message 
    });
  }
});

export default router;