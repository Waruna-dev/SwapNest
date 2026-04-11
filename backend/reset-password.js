import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import DB Connection
import connectDB from "./config/db.js";
import User from "./models/User.js";

async function resetPassword() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    const email = 'sewmini234@gmail.com';
    const newPassword = 'thanuja210'; // The password they're trying to use

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return;
    }

    console.log('Found user:', user.email);
    console.log('User ID:', user._id);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log('Password reset successful for:', email);
    console.log('New password hash has been saved');

    // Test the password
    const isMatch = await bcrypt.compare(newPassword, user.password);
    console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

resetPassword();
