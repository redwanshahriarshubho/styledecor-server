// ===================================================================
// StyleDecor Backend Server - Complete index.js
// ===================================================================
// File Location: styledecor-server/index.js
// ===================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB, getDb } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const decoratorRoutes = require('./routes/decoratorRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================================================
// MIDDLEWARE CONFIGURATION
// ===================================================================

// ✅ CORS Configuration - CRITICAL FIX
// This allows frontend (port 5173) to communicate with backend (port 5000)
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default port
    'http://localhost:3000',  // React default port
    'http://localhost:5174',  // Alternative Vite port
    'http://localhost:5175'   // Another alternative
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===================================================================
// ROUTES
// ===================================================================

// Health check endpoint
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/decorators', decoratorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// ===================================================================
// ERROR HANDLING
// ===================================================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/social-login',
      'GET /api/services',
      'GET /api/bookings/my-bookings',
      'GET /api/decorators/top',
      'GET /api/users/profile'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// ===================================================================
// DATABASE CONNECTION & SERVER START
// ===================================================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB!');

    // Get database instance
    const db = getDb();
    
    // Create indexes for better performance
    try {
      // Users collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ status: 1 });
      
      // Services collection indexes
      await db.collection('services').createIndex({ service_category: 1 });
      await db.collection('services').createIndex({ cost: 1 });
      
      // Bookings collection indexes
      await db.collection('bookings').createIndex({ userId: 1 });
      await db.collection('bookings').createIndex({ status: 1 });
      await db.collection('bookings').createIndex({ paymentStatus: 1 });
      await db.collection('bookings').createIndex({ bookingDate: 1 });
      
      // Payments collection indexes
      await db.collection('payments').createIndex({ userId: 1 });
      await db.collection('payments').createIndex({ bookingId: 1 });
      await db.collection('payments').createIndex({ createdAt: -1 });
      
      console.log('✅ Database indexes created');
    } catch (indexError) {
      console.log('⚠️  Some indexes may already exist:', indexError.message);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SERVER IS RUNNING');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`👨‍💻 Developer: Redwan Shahriar`);
      console.log(`📅 Started: ${new Date().toLocaleString()}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📋 Available API Endpoints:');
      console.log('   🔹 GET  /                              - Health check');
      console.log('   🔹 POST /api/auth/register             - User registration');
      console.log('   🔹 POST /api/auth/login                - User login');
      console.log('   🔹 POST /api/auth/social-login         - Google login');
      console.log('   🔹 GET  /api/services                  - Get all services');
      console.log('   🔹 POST /api/services                  - Create service (Admin)');
      console.log('   🔹 GET  /api/bookings/my-bookings      - Get user bookings');
      console.log('   🔹 POST /api/bookings                  - Create booking');
      console.log('   🔹 POST /api/payments/create-payment-intent - Create payment');
      console.log('   🔹 GET  /api/decorators/top            - Get top decorators');
      console.log('   🔹 GET  /api/users/profile             - Get user profile');
      console.log('   🔹 GET  /api/users/all                 - Get all users (Admin)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n💡 Test with: curl http://localhost:' + PORT);
      console.log('💡 Frontend should connect to: http://localhost:' + PORT);
      console.log('\n⚠️  Make sure frontend .env has: VITE_API_URL=http://localhost:' + PORT);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error(error);
    console.error('\n💡 Common issues:');
    console.error('   1. Check MongoDB connection string in .env');
    console.error('   2. Make sure MongoDB Atlas IP whitelist includes your IP');
    console.error('   3. Verify all required packages are installed (npm install)');
    console.error('   4. Check if port 5000 is already in use\n');
    process.exit(1);
  }
};

// ===================================================================
// PROCESS ERROR HANDLERS
// ===================================================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n❌ Unhandled Promise Rejection:');
  console.error(err);
  console.error('\n💡 This usually means there\'s an async operation that failed without proper error handling.');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n❌ Uncaught Exception:');
  console.error(err);
  console.error('\n💡 This is a critical error. The server will shut down.');
  process.exit(1);
});

// Handle SIGTERM (graceful shutdown)
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// ===================================================================
// START THE SERVER
// ===================================================================

startServer();

module.exports = app;