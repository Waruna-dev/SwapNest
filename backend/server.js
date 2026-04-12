import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import path from "path";

// Fix __dirname for ES modules 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment variables loaded:');
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value:', process.env.JWT_SECRET);

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
import contactRoutes from "./routes/contactRoutes.js";
import notificationRoutes from './routes/notificationRoutes.js';
import geocodingRoutes from './routes/geocoding.js';
import simpleVolunteerHelpRoutes from "./routes/simpleVolunteerHelpRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from './routes/adminRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// =======================
// 1. GLOBAL MIDDLEWARES (Runs first!)
// =======================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Moved to the top so it logs EVERY incoming request

// =======================
// 2. ROUTES (The core application)
// =======================
app.use('/api/swaps', swapRoutes); 
app.use("/api/items", itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/geocoding", geocodingRoutes);
app.use("/api/simple-volunteer-help", simpleVolunteerHelpRoutes);
app.use("/api/test", testRoutes);
app.use('/api/admin', adminRoutes);

// In server.js - This serves files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// TEST ROUTE 
app.get("/", (req, res) => {
  res.status(200).json({ message: "SwapNest API is running..." });
});

// =======================
// 3. ERROR HANDLING (The Safety Net at the bottom)
// =======================
app.use(notFound);
app.use(errorHandler);

// =======================
// 4. SERVER STARTUP
// =======================
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));