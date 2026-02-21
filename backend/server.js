import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

// Initialize MongoDB connection
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Default Mongo URI if not provided
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoswap";

// Connect to Database
connectDB();

const app = express();

// --- GLOBAL MIDDLEWARE ---
// Enable CORS for frontend-backend communication
// Middleware
app.use(cors());
// Parse incoming raw JSON requests (e.g., login credentials)
app.use(express.json());
// Parse incoming URL-encoded form data (required for Multer image uploads)
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// --- ROUTES ---
// Mount the user authentication and profile routes
app.use('/api/users', require('./routes/userRoutes'));

// Basic health-check route to confirm the API is running
app.get('/', (req, res) => {
    res.status(200).json({ message: 'SwapNest API is running' });
});

// --- ERROR HANDLING ---
// Catches any errors thrown in the routes and formats them as JSON
app.use(errorHandler);

// Start the Express server
app.listen(port, () => console.log(`Server started on port ${port}`));
// Routes
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("EcoSwap API is running...");
});

// Error Handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

