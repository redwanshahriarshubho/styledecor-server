 import express from 'express'; 

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import { getDb } from '../config/db.js';  // ✅ FIXED: lowercase 'b'



const router = express.Router();



// Register

router.post('/register', async (req, res) => {

  try {

    const { name, email, password, photoURL } = req.body;

    const db = getDb();  // ✅ FIXED: lowercase 'b'



    // Check if user exists

    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {

      return res.status(400).json({ message: 'User already exists' });

    }



    // Hash password

    const hashedPassword = await bcrypt.hash(password, 10);



    // Create user

    const user = {

      name,

      email,

      password: hashedPassword,

      photoURL: photoURL || '',

      role: 'user',

      status: 'active',

      createdAt: new Date(),

      updatedAt: new Date()

    };



    const result = await db.collection('users').insertOne(user);



    // Generate token

    const token = jwt.sign(

      { userId: result.insertedId.toString(), email, role: 'user' },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }

    );



    // Return user data without password

    delete user.password;

    user._id = result.insertedId;



    res.status(201).json({

      success: true,

      token,

      user: {

        userId: result.insertedId.toString(),

        name: user.name,

        email: user.email,

        photoURL: user.photoURL,

        role: user.role,

        createdAt: user.createdAt

      }

    });

  } catch (error) {

    console.error('Registration error:', error);

    res.status(500).json({ message: 'Registration failed', error: error.message });

  }

});



// Login

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    const db = getDb();  // ✅ FIXED: lowercase 'b'



    // Find user

    const user = await db.collection('users').findOne({ email });

    if (!user) {

      return res.status(401).json({ message: 'Invalid credentials' });

    }



    // Check password

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {

      return res.status(401).json({ message: 'Invalid credentials' });

    }



    // Check if user is active

    if (user.status !== 'active') {

      return res.status(403).json({ message: 'Account is disabled' });

    }



    // Generate token

    const token = jwt.sign(

      { userId: user._id.toString(), email: user.email, role: user.role },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }

    );



    // Return user data without password

    delete user.password;



    res.json({

      success: true,

      token,

      user: {

        userId: user._id.toString(),

        name: user.name,

        email: user.email,

        photoURL: user.photoURL,

        role: user.role,

        status: user.status,

        createdAt: user.createdAt

      }

    });

  } catch (error) {

    console.error('Login error:', error);

    res.status(500).json({ message: 'Login failed', error: error.message });

  }

});



// Social Login (Google)

router.post('/social-login', async (req, res) => {

  try {

    const { name, email, photoURL } = req.body;

    const db = getDb();  // ✅ FIXED: lowercase 'b'



    // Check if user exists

    let user = await db.collection('users').findOne({ email });



    if (!user) {

      // Create new user

      const newUser = {

        name,

        email,

        photoURL: photoURL || '',

        role: 'user',

        status: 'active',

        password: '', // No password for social login

        createdAt: new Date(),

        updatedAt: new Date()

      };



      const result = await db.collection('users').insertOne(newUser);

      user = { ...newUser, _id: result.insertedId };

    }



    // Generate token

    const token = jwt.sign(

      { userId: user._id.toString(), email: user.email, role: user.role },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }

    );



    res.json({

      success: true,

      token,

      user: {

        userId: user._id.toString(),

        name: user.name,

        email: user.email,

        photoURL: user.photoURL,

        role: user.role,

        status: user.status,

        createdAt: user.createdAt

      }

    });

  } catch (error) {

    console.error('Social login error:', error);

    res.status(500).json({ message: 'Social login failed', error: error.message });

  }

});



export default router;