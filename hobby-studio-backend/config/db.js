const mongoose = require('mongoose');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1 || isConnecting) return;
  isConnecting = true;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✓ MongoDB connected successfully: ${conn.connection.host}`);
    isConnecting = false;
  } catch (err) {
    isConnecting = false;
    console.error('\n⚠️ MongoDB Connection Warning:');
    console.error(err.message);
    if (err.message.includes('whitelist') || err.name === 'MongooseServerSelectionError') {
      console.error('\n👉 Action Required: If using MongoDB Atlas, make sure your IP is whitelisted (or 0.0.0.0/0 is added in Atlas Network Access).');
      console.error('👉 Visit: https://cloud.mongodb.com -> Network Access -> Add IP Address (0.0.0.0/0)\n');
    }
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting reconnect...');
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;