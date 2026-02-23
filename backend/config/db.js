import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Attempt to connect using the URI from the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the Node.js process with a "failure" code (1) if the connection fails
    process.exit(1);
  }
};

export default connectDB;
