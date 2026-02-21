const mongoose = require('mongoose');

/**
 * @desc Mongoose schema for the SwapNest User entity
 * Defines the structure, data types, and validation rules for MongoDB
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
        enum: ['user', 'admin'], // Restricts the role to only these two options
        default: 'user'
    },
    location: {
        type: String,
        default: '' // Optional field for local thrift/swap filtering
    },
    profilePic: {
        type: String,
        default: '' // Stores the Cloudinary image URL
    }
}, {
    // Automatically creates 'createdAt' and 'updatedAt' timestamp fields
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);