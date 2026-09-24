import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://copysupport01_db_user:PlSbN6jBaGZyUZ0m@cluster0.p02ss9y.mongodb.net/ecopy?retryWrites=true&w=majority";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[Ecopy Server] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Ecopy Server Error] MongoDB Connection Failure: ${error.message}`);
  }
};

