// backend/server.js (or app.js)

import express from "express";
import mongoose from "mongoose";
import volunteerRoutes from "./routers/VolunteerRoutes.js"; // your routes
import { notFound, errorHandler } from "./middlewares/volunteermiddlewares.js";

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Use your volunteer routes
app.use("/api/volunteers", volunteerRoutes);

// Error handling middleware (should be after all routes)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
const mongoURI = "YOUR_MONGODB_URI_HERE"; // replace with your MongoDB connection string
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
