import 'dotenv/config';

import express from 'express';
import cors from 'cors';


import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';


import userRoutes from './routes/userRoutes.js';

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
app.use(express.urlencoded({ extended: true })); 

// =======================
// ROUTES
// =======================
app.use('/api/users', userRoutes);

// A simple test route to prove your server is live during the demo
app.get('/', (req, res) => {
    res.status(200).json({ message: 'SwapNest API is running perfectly.' });
});

// =======================
// ERROR HANDLING
// =======================
app.use(errorHandler);

// =======================
// SERVER STARTUP
// =======================
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SwapNest User Server started on port ${port}`));
