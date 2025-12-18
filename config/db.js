// File: config/db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let db;

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // fail fast if cannot connect
    });

    await client.connect();
    db = client.db(); // database name from URI
    console.log('✅ MongoDB connected successfully');

  } catch (error) {
    console.error('❌ MongoDB connection error:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not connected yet');
  }
  return db;
};
