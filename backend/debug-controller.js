import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://SwapNest:SwapNest475@swapnest.rk4z2pg.mongodb.net/swapnest?retryWrites=true&w=majority');

const debugController = async () => {
  try {
    console.log('Debugging authentication controller...\n');
    
    const email = 'test@example.com';
    const password = 'Test@12345';
    
    console.log('1. Starting user lookup...');
    const startTime = Date.now();
    
    const user = await User.findOne({ email });
    const lookupTime = Date.now() - startTime;
    
    console.log(`2. User lookup completed in ${lookupTime}ms`);
    
    if (!user) {
      console.log('3. User not found');
      process.exit(1);
    }
    
    console.log('3. User found:', user.email);
    console.log('4. Starting password comparison...');
    
    const compareStart = Date.now();
    const isMatch = await bcrypt.compare(password, user.password);
    const compareTime = Date.now() - compareStart;
    
    console.log(`5. Password comparison completed in ${compareTime}ms`);
    console.log('6. Password match result:', isMatch);
    
    if (isMatch) {
      console.log('7. Authentication should succeed');
    } else {
      console.log('7. Authentication should fail');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
};

debugController();
