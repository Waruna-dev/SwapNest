const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const morgan=require('morgan');
//const helmet=require('helmet');  --- not yet installed
const path=require('path');


const connectDB=require('./config/db')
require('dotenv').config();

const app=express();
const swapRoutes = require('./routers/swapRoutes');
const itemRoutes = require('./routers/ItemRoutes');
const userRoutes = require('./routers/userRoutes');


connectDB();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

app.use('/api/swaps', swapRoutes); 
//app.use("/api/items", itemRoutes);
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
