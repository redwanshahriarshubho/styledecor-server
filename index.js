import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import decoratorsRoutes from './routes/decorators.routes.js';
import usersRoutes from './routes/users.routes.js';
import paymentsRoutes from './routes/payment.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StyleDecor API is running 🚀'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/decorators', decoratorsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
