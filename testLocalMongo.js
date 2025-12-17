import { MongoClient } from 'mongodb';

const uri = "mongodb://127.0.0.1:27017/styledecor"; // Local MongoDB

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
});

async function testLocalConnection() {
  try {
    console.log('🔄 Connecting to local MongoDB...');
    
    await client.connect();
    console.log('✅ MongoDB Connected Successfully!');

    // Ping database
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful!');

    // List collections
    const db = client.db('styledecor');
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));

    console.log('🎉 Local MongoDB is working perfectly!');
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.error('Full Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testLocalConnection();
