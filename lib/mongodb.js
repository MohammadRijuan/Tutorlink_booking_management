import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || { conn: null, promise: null };

global.mongoose = cached;

async function connectDb() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  cached.promise = mongoose.connect(MONGODB_URI, {
    dbName: 'tutorlink',
  });

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDb;
