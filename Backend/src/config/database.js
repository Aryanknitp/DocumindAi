import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/documind_ai",
      {
        serverSelectionTimeoutMS: 10000,
      },
    );

    console.log(`MongoDB connected`);
    return connection;
  } catch (error) {
    console.warn(
      "MongoDB connection failed. Starting server without database connectivity until a valid MONGODB_URI is configured.",
      error.message,
    );
    return null;
  }
};

export default connectDB;
