import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { verifyToken, verifyAdmin, verifyDecorator } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const { 
      serviceId, 
      serviceName,
      serviceCost,
      bookingDate, 
      location,
      notes
    } = req.body;

    const newBooking = {
      serviceId: new ObjectId(serviceId),
      serviceName,
      serviceCost: parseFloat(serviceCost),
      bookingDate: new Date(bookingDate),
      location,
      notes: notes || '',
      userEmail: req.user.email,
      userName: req.body.userName,
      userId: new ObjectId(req.user.userId),
      status: 'pending',
      paymentStatus: 'unpaid',
      projectStatus: null,
      assignedDecorator: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(newBooking);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { _id: result.insertedId, ...newBooking }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
});

router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { userEmail: req.user.email };
    const total = await db.collection('bookings').countDocuments(query);
    
    const bookings = await db.collection('bookings')
      .find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: bookings,
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
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
});

router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      paymentStatus = '',
      sort = 'createdAt' 
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await db.collection('bookings').countDocuments(query);
    
    const bookings = await db.collection('bookings')
      .find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: bookings,
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
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (req.user.role !== 'admin' && booking.userEmail !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch booking', 
      error: error.message 
    });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const { bookingDate, location, notes } = req.body;
    
    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (req.user.role !== 'admin' && booking.userEmail !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const updateData = {
      bookingDate: bookingDate ? new Date(bookingDate) : booking.bookingDate,
      location: location || booking.location,
      notes: notes || booking.notes,
      updatedAt: new Date()
    };

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking', 
      error: error.message 
    });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (req.user.role !== 'admin' && booking.userEmail !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel paid booking. Contact admin for refund.' 
      });
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'cancelled', updatedAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel booking', 
      error: error.message 
    });
  }
});

router.post('/:id/assign-decorator', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { decoratorId, decoratorName, decoratorEmail } = req.body;

    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot assign decorator to unpaid booking' 
      });
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          assignedDecorator: {
            id: new ObjectId(decoratorId),
            name: decoratorName,
            email: decoratorEmail
          },
          projectStatus: 'Assigned',
          status: 'confirmed',
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Decorator assigned successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to assign decorator', 
      error: error.message 
    });
  }
});

router.put('/:id/project-status', verifyToken, verifyDecorator, async (req, res) => {
  try {
    const db = getDb();
    const { projectStatus } = req.body;

    const validStatuses = [
      'Assigned',
      'Planning Phase',
      'Materials Prepared',
      'On the Way to Venue',
      'Setup in Progress',
      'Completed'
    ];

    if (!validStatuses.includes(projectStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project status' 
      });
    }

    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (req.user.role !== 'admin' && 
        booking.assignedDecorator?.email !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this project' 
      });
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          projectStatus,
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Project status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status', 
      error: error.message 
    });
  }
});

router.get('/decorator/assigned', verifyToken, verifyDecorator, async (req, res) => {
  try {
    const db = getDb();
    const bookings = await db.collection('bookings')
      .find({ 
        'assignedDecorator.email': req.user.email 
      })
      .sort({ bookingDate: -1 })
      .toArray();

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch assigned projects', 
      error: error.message 
    });
  }
});

export default router;