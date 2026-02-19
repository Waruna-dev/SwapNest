import mongoose from "mongoose";

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2000;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(" DB Connection Error: MONGO_URI is not set. Add it to backend/.env");
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(` MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(` DB Connection Error (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      if (attempt < MAX_RETRIES) {
        console.log(` Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        console.error(" Server will run without DB (in-memory data only).");
      }
    }
  }
};

export default connectDB;
