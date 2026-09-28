import 'dotenv/config';
import mongoose from 'mongoose';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://copysupport01_db_user:PlSbN6jBaGZyUZ0m@cluster0.p02ss9y.mongodb.net/ecopy?retryWrites=true&w=majority";
    cachedPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      family: 4, // Force IPv4 to prevent Vercel serverless DNS resolution timeout
    }).then((conn) => {
      console.log(`[Ecopy Server] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }).catch((err) => {
      cachedPromise = null;
      console.error(`[Ecopy Server Error] MongoDB Connection Failure: ${err.message}`);
      throw err;
    });
  }

  return cachedPromise;
};
