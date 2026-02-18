const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Adding your SDG feature here
    co2Saved: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);