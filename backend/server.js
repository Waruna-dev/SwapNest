import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
// import helmet from 'helmet';  //

import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import swapRoutes from './routes/swapRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app=express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

app.use('/api/swaps', swapRoutes); 
app.use("/api/items", itemRoutes);
app.use('/api/users', userRoutes);

//404
app.use((req,res)=>{
    console.log('404 not found:', req.method,req.url);
    res.status(404).json({
        success:false,
        message:'Route not found'
    });
});

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})
