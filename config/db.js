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
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
    });

    await client.connect();
    db = client.db(); // database name from URI
    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', db.databaseName);

  } catch (error) {
    console.error('❌ MongoDB connection error:');
    console.error('Message:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('');
      console.error('⚠️  DNS Resolution Failed!');
      console.error('Possible fixes:');
      console.error('1. Check your internet connection');
      console.error('2. Try using SRV connection string format');
      console.error('3. Disable VPN/Proxy if running');
      console.error('4. Check if MongoDB Atlas cluster is active');
      console.error('5. Verify connection string in .env file');
      console.error('');
    }
    
    process.exit(1);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not connected yet');
  }
  return db;
};