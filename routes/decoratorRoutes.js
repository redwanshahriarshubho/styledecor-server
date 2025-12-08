import express from 'express';
import { getDB } from '../config/db.js';

const router = express.Router();

// Get all decorators
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const decorators = await db.collection('users')
      .find(
        { role: 'decorator', status: 'active' },
        { projection: { password: 0 } }
      )
      .sort({ 'decoratorInfo.rating': -1 })
      .toArray();

    res.json({
      success: true,
      data: decorators
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch decorators', 
      error: error.message 
    });
  }
});

// Get top decorators
router.get('/top', async (req, res) => {
  try {
    const db = getDB();
    const limit = parseInt(req.query.limit) || 6;
    
    const decorators = await db.collection('users')
      .find(
        { role: 'decorator', status: 'active' },
        { projection: { password: 0 } }
      )
      .sort({ 'decoratorInfo.rating': -1 })
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      data: decorators
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top decorators', 
      error: error.message 
    });
  }
});

export default router;