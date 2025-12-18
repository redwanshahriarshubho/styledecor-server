// File: index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB, getDb } from './config/db.js';

// -------- ROUTES --------
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import decoratorsRoutes from './routes/decorators.routes.js';
import usersRoutes from './routes/users.routes.js';
import paymentsRoutes from './routes/payment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// ===============================
// ROOT ROUTE
// ===============================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StyleDecor API is running 🚀',
    developer: 'Redwan Shahriar',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// ===============================
// API ROUTES
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/decorators', decoratorsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===============================
// START SERVER
// ===============================
const startServer = async () => {
  try {
    await connectDB();
    const db = getDb();

    // Ensure indexes
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('services').createIndex({ service_category: 1 });
      await db.collection('bookings').createIndex({ userId: 1 });
      await db.collection('payments').createIndex({ bookingId: 1, createdAt: -1 });
      console.log('✅ Database indexes ensured');
    } catch (indexError) {
      console.log('⚠️ Index creation warning:', indexError.message);
    }

    app.listen(PORT, () => {
      console.log(`✅ SERVER IS RUNNING on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ===============================
// PROCESS ERROR HANDLING
// ===============================
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received');
  process.exit(0);
});

// ===============================
// INIT
// ===============================
startServer();

export default app;
