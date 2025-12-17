// ===================================================================
// StyleDecor Backend Server - ES MODULE VERSION
// ===================================================================

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB, getDb } from './config/db.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import decoratorRoutes from './routes/decoratorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================================================
// MIDDLEWARE CONFIGURATION
// ===================================================================

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===================================================================
// ROUTES
// ===================================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StyleDecor API is running!',
    developer: 'Redwan Shahriar',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/decorators', decoratorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// ===================================================================
// ERROR HANDLING
// ===================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err })
  });
});

// ===================================================================
// DATABASE CONNECTION & SERVER START
// ===================================================================

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB!');

    const db = getDb();

    // Create indexes (users/services/bookings/payments)
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ status: 1 });
      await db.collection('services').createIndex({ service_category: 1 });
      await db.collection('services').createIndex({ cost: 1 });
      await db.collection('bookings').createIndex({ userId: 1 });
      await db.collection('bookings').createIndex({ status: 1 });
      await db.collection('bookings').createIndex({ paymentStatus: 1 });
      await db.collection('bookings').createIndex({ bookingDate: 1 });
      await db.collection('payments').createIndex({ userId: 1 });
      await db.collection('payments').createIndex({ bookingId: 1 });
      await db.collection('payments').createIndex({ createdAt: -1 });

      console.log('✅ Database indexes created');
    } catch (indexError) {
      console.log('⚠️  Some indexes may already exist:', indexError.message);
    }

    app.listen(PORT, () => {
      console.log(`\n✅ SERVER IS RUNNING on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ===================================================================
// PROCESS ERROR HANDLERS
// ===================================================================

process.on('unhandledRejection', (err) => { console.error(err); process.exit(1); });
process.on('uncaughtException', (err) => { console.error(err); process.exit(1); });
process.on('SIGTERM', () => { console.log('SIGTERM received'); process.exit(0); });
process.on('SIGINT', () => { console.log('SIGINT received'); process.exit(0); });

startServer();

export default app;
