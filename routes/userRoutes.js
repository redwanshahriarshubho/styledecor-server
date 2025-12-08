import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
});

// Get all users (Admin)
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users', 
      error: error.message 
    });
  }
});

// Make user decorator (Admin)
router.put('/:id/make-decorator', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { specialty, experience, rating } = req.body;

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          role: 'decorator',
          decoratorInfo: {
            specialty: specialty || 'General Decoration',
            experience: experience || 0,
            rating: rating || 5.0,
            totalProjects: 0
          },
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'User promoted to decorator successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to make decorator', 
      error: error.message 
    });
  }
});

// Disable/Enable user account (Admin)
router.put('/:id/toggle-status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const newStatus = user.status === 'active' ? 'disabled' : 'active';

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    res.json({
      success: true,
      message: `User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle user status', 
      error: error.message 
    });
  }
});

export default router;