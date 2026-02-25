import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

import volunteerRoutes from "./routes/VolunteerRoutes.js";
import { notFound, errorHandler } from "./middlewares/volunteermiddlewares.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, ".env") });

// Fallback Mongo URI (if not in .env)
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoswap";

// Create Express app
const app = express();

// =======================
// MIDDLEWARES
// =======================

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent destructure errors
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.use(cors());
app.use(morgan("dev"));

// =======================
// ROUTES
// =======================

// Test route
app.get("/", (req, res) => {
  res.send("API running...");
});

// Volunteer routes
app.use("/api/volunteers", volunteerRoutes);

// =======================
// ERROR HANDLING
// =======================

app.use(notFound);
app.use(errorHandler);

// =======================
// DATABASE CONNECTION
// =======================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB Connected");

    // Start server only after DB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err);
    process.exit(1);
  });