import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let db;

export const connectDb = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('MongoDB connected');
  } catch (error) {
    console.error('DB connection error:', error);
  }
};

export const getDb = () => db;
