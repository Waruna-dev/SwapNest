import 'dotenv/config';

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

// Fix __dirname for ES modules 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import DB Connection
import connectDB from "./config/db.js";

// Import Middlewares
import { notFound, errorHandler } from "./middlewares/volunteermiddlewares.js";

// Import Routes
import userRoutes from "./routes/userRoutes.js"; 
import itemRoutes from "./routes/itemRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import volunteerRoutes from "./routes/VolunteerRoutes.js";
import pickupRoutes from "./routes/PickupRoutes.js";
import centerRoutes from "./routes/CenterRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();

// =======================
// GLOBAL MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());
// Using extended: true from the team's code to support complex form data
app.use(express.urlencoded({ extended: true }));

// Prevent destructure errors inside middlewares / routes
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

// Logging middleware
app.use(morgan("dev"));

// =======================
// ROUTES
// =======================

app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/centers", centerRoutes);

// TEST ROUTE (Combined)
app.get("/", (req, res) => {
  res.status(200).json({ message: "SwapNest API is running..." });
});

// =======================
// ERROR HANDLING
// =======================
app.use(notFound);
app.use(errorHandler);

// =======================
// SERVER STARTUP
// =======================
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
