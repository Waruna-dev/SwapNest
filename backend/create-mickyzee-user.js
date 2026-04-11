import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://SwapNest:SwapNest475@swapnest.rk4z2pg.mongodb.net/swapnest?retryWrites=true&w=majority');

const createMickyzeeUser = async () => {
  try {
    console.log('Creating user for mickyzee43@gmail.com...\n');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'mickyzee43@gmail.com' });
    if (existingUser) {
      console.log('User mickyzee43@gmail.com already exists');
      process.exit(0);
    }
    
    // Hash password for User model
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test@12345', salt);
    
    const newUser = new User({
      username: 'mickyzee43',
      email: 'mickyzee43@gmail.com',
      password: hashedPassword, // Pre-hashed password
      role: 'user'
    });

    await newUser.save();
    console.log('✅ User created: mickyzee43@gmail.com / Test@12345');
    console.log('\n🎉 User account ready for login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

createMickyzeeUser();
