const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

const port = process.env.PORT || 5000;

// Initialize MongoDB connection
connectDB();

const app = express();

// --- GLOBAL MIDDLEWARE ---
// Enable CORS for frontend-backend communication
app.use(cors());
// Parse incoming raw JSON requests (e.g., login credentials)
app.use(express.json());
// Parse incoming URL-encoded form data (required for Multer image uploads)
app.use(express.urlencoded({ extended: false }));

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