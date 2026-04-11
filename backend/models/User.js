import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Make sure bcryptjs is imported!

/**
 * @desc Mongoose schema for the SwapNest User entity
 */
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'volunteer', 'admin'], 
        default: 'user'
    },
    bio: {
        type: String,
        default: '' 
    },
    profilePic: {
        type: String,
        default: '' 
    },
    // Location information
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    district: {
        type: String,
        default: ''
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    }
}, {
    timestamps: true
});

// --- CRITICAL: Teach Mongoose how to verify passwords ---
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);