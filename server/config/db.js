import 'dotenv/config';
import mongoose from 'mongoose';

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://copysupport01_db_user:PlSbN6jBaGZyUZ0m@cluster0.p02ss9y.mongodb.net/ecopy?retryWrites=true&w=majority";
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[Ecopy Server] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Ecopy Server Error] MongoDB Connection Failure: ${error.message}`);
  }
};
