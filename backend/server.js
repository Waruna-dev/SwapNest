import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

const app = express();

dotenv.config();

// Default Mongo URI if not provided
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoswap";

connectDB();
