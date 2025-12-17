// ===================================================================
// Database Configuration - ES MODULE VERSION
// ===================================================================

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let db;
let client;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    client = new MongoClient(uri);
    await client.connect();

    db = client.db('styledecor');

    console.log('✅ MongoDB Connected Successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};
