import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set. Add it to backend/.env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(" DB Connection Error:", error.message);
    console.error(" Server will run without DB (in-memory data only).");
  }
};

export default connectDB;
