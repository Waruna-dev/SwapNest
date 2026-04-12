import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
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
import contactRoutes from "./routes/contactRoutes.js";
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// =======================
// 1. GLOBAL MIDDLEWARES (Runs first!)
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Moved to the top so it logs EVERY incoming request

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// 2. ROUTES (The core application)
// =======================
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/swaps', swapRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// TEST ROUTE 
app.get("/", (req, res) => {
  res.status(200).json({ message: "SwapNest API is running..." });
});

// =======================
// 3. ERROR HANDLING (The Safety Net at the bottom)
// =======================
// I removed the manual 404 because you are already importing 
// your custom 'notFound' middleware from your volunteer middlewares!
app.use(notFound);
app.use(errorHandler);

// =======================
// 4. SERVER STARTUP
// =======================
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));