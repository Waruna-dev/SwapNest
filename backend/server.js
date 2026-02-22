import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

// Default Mongo URI if not provided
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoswap";

// Connect to Database
connectDB();

const app = express();

// Use 5001 as default port
const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Routes
