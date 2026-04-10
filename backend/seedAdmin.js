import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // <-- NEW: Import bcryptjs
import User from './models/User.js'; 

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const adminExists = await User.findOne({ email: 'curator@swapnest.com' });

    if (adminExists) {
      console.log('⚠️ Admin account already exists. Cancelling seed.');
      process.exit();
    }

    // --- NEW: Hash the password securely ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);

    await User.create({
      username: 'SwapNestCurator', 
      email: 'curator@swapnest.com',
      password: hashedPassword, // <-- FIXED: Passing the secure hash instead of plain text
      role: 'admin',
    });

    console.log('✅ Master Admin successfully seeded!');
    process.exit(); 
    
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1); 
  }
};

seedAdmin();