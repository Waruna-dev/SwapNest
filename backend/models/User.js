import mongoose from 'mongoose';

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
    role: {
        type: String,
        enum: ['user', 'volunteer', 'admin'], 
        default: 'user'
    },
    location: {
        type: String,
        default: '' 
    },
    profilePic: {
        type: String,
        default: '' 
    }
}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema);