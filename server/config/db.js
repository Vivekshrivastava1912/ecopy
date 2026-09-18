import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vivekshrivastava1912_db_user:OX71IvYVdk94G4T5@cluster0.ptielji.mongodb.net/exopy?retryWrites=true&w=majority";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[Exopy Server] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Exopy Server Error] MongoDB Connection Failure: ${error.message}`);
    // Non-fatal fallback for offline local mode if database connection has network restrictions
  }
};
