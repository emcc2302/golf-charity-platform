const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Support both MONGO_URI and MONGODB_URI
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MongoDB URI not found. Set MONGO_URI in your .env file');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
