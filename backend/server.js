import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/volunteermiddlewares.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoswap";
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


// Test route
app.get("/", (req, res) => {
  res.send("API running...");
});
// Use middleware for unknown routes and error handling
app.use(notFound);
app.use(errorHandler);
// Error handling
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
