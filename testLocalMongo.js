import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/styledecor';
const client = new MongoClient(uri);

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();

    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB ping successful');

    const collections = await client
      .db('styledecor')
      .listCollections()
      .toArray();

    console.log(
      '📦 Collections:',
      collections.map(c => c.name)
    );

  } catch (error) {
    console.error('❌ MongoDB error:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
