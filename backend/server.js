import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";
//import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
//import { errorHandler } from "./middlewares/errorMiddleware.js";

// Load .env variables
dotenv.config();

// Connect DB
connectDB();

const app = express();

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// ROUTES
//app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.status(200).json({ message: "SwapNest API is running" });
});

// ERROR HANDLER (must be last)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
//
