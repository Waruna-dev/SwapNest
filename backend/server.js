import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

import volunteerRoutes from "./routes/VolunteerRoutes.js";
import pickupRoutes from "./routes/PickupRoutes.js";
import centerRoutes from "./routes/CenterRoutes.js";                // ← ADDED
import { notFound, errorHandler } from "./middlewares/volunteermiddlewares.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Import DB Connection
import connectDB from "./config/db.js";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import volunteerRoutes from "./routes/VolunteerRoutes.js";

// Import Middlewares
import { notFound, errorHandler } from "./middlewares/volunteermiddlewares.js";

// Connect DB
connectDB();

const app = express();

// =======================
// GLOBAL MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent destructure errors inside middlewares / routes
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.use(morgan("dev"));

// =======================
// ROUTES
// =======================
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/volunteers", volunteerRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API running...");
});

// Volunteer routes
app.use("/api/volunteers", volunteerRoutes);

// Pickup routes
app.use("/api/pickups", pickupRoutes);

// Center routes
app.use("/api/centers", centerRoutes);                              // ← ADDED

// =======================
// ERROR HANDLING
// =======================
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
