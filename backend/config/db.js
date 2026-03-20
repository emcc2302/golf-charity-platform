const mongoose = require('mongoose');

const connectDB = async () => {
  // Support all common naming conventions
  const uri = process.env.MONGO_URI
    || process.env.MONGODB_URI
    || process.env.DATABASE_URL
    || process.env.MONGO_URL;

  if (!uri) {
    console.error('❌ MongoDB URI missing! Set MONGO_URI in Vercel environment variables.');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;