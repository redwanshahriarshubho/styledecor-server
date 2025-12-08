import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('styledecor');
    console.log('✅ Connected to MongoDB!');
    
    await createIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('services').createIndex({ service_name: 'text' });
    await db.collection('services').createIndex({ service_category: 1 });
    await db.collection('bookings').createIndex({ userEmail: 1 });
    await db.collection('bookings').createIndex({ bookingDate: 1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.log('Index creation warning:', error.message);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export { client };