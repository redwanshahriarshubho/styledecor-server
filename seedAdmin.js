import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('styledecor');

    const existingAdmin = await db.collection('users').findOne({
      email: 'admin@styledecor.com'
    });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await db.collection('users').insertOne({
      name: 'Redwan Shahriar',
      email: 'admin@styledecor.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('🎉 Admin user created successfully');
    console.log('📧 admin@styledecor.com');
    console.log('🔑 Admin@123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await client.close();
  }
};

seedAdmin();
