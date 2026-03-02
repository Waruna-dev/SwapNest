import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

const port = process.env.PORT || 5000;

// Initialize MongoDB connection
connectDB();

const app = express();

// --- GLOBAL MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- ROUTES ---
// Mount the user routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'SwapNest API is running' });
});

// --- ERROR HANDLING ---
app.use(errorHandler);

// Start the Express server
app.listen(port, () => console.log(`Server started on port ${port}`));
