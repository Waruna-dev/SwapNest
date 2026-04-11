
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Attempt to connect using the URI from the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't exit the process - allow server to continue running for testing
    console.log('Server will continue running without database connection...');
  }
};

export default connectDB;

