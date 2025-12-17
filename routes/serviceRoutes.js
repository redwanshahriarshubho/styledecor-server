import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { 
      search = '', 
      category = '', 
      minPrice = 0, 
      maxPrice = 1000000,
      page = 1,
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    const query = {};
    
    if (search) {
      query.service_name = { $regex: search, $options: 'i' };
    }
    
    if (category && category !== 'all') {
      query.service_category = category;
    }
    
    query.cost = { 
      $gte: parseFloat(minPrice), 
      $lte: parseFloat(maxPrice) 
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await db.collection('services').countDocuments(query);
    
    const services = await db.collection('services')
      .find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch services', 
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const service = await db.collection('services').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service', 
      error: error.message 
    });
  }
});

router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { 
      service_name, 
      cost, 
      unit, 
      service_category, 
      description,
      image
    } = req.body;

    const newService = {
      service_name,
      cost: parseFloat(cost),
      unit,
      service_category,
      description,
      image: image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
      createdByEmail: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    const result = await db.collection('services').insertOne(newService);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { _id: result.insertedId, ...newService }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create service', 
      error: error.message 
    });
  }
});

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { 
      service_name, 
      cost, 
      unit, 
      service_category, 
      description,
      image 
    } = req.body;

    const updateData = {
      service_name,
      cost: parseFloat(cost),
      unit,
      service_category,
      description,
      image,
      updatedAt: new Date()
    };

    const result = await db.collection('services').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update service', 
      error: error.message 
    });
  }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('services').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete service', 
      error: error.message 
    });
  }
});

router.get('/meta/categories', async (req, res) => {
  try {
    const db = getDb();
    const categories = await db.collection('services').distinct('service_category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories', 
      error: error.message 
    });
  }
});

export default router;