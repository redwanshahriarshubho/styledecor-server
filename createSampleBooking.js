import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const createSampleBooking = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('styledecor');

    // Get a service
    const service = await db.collection('services').findOne({ 
      service_category: 'wedding' 
    });

    // Get admin user
    const admin = await db.collection('users').findOne({ 
      email: 'admin@styledecor.com' 
    });

    if (!service || !admin) {
      console.log('Service or admin not found');
      return;
    }

    const booking = {
      serviceId: service._id,
      serviceName: service.service_name,
      serviceCost: service.cost,
      bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Gulshan-2, Dhaka, Bangladesh',
      notes: 'Please use white and gold theme',
      userId: admin._id,
      userEmail: admin.email,
      userName: admin.name,
      status: 'pending',
      paymentStatus: 'unpaid',
      projectStatus: null,
      assignedDecorator: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('bookings').insertOne(booking);
    console.log('✅ Sample booking created!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
};

createSampleBooking();