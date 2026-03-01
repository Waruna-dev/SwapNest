import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js'; // Must include .js extension!

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashedPassword });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let profileImageUrl = user.profilePic;
    if (req.file) {
        profileImageUrl = req.file.path; 
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            username: req.body.username || user.username,
            location: req.body.location || user.location,
            profilePic: profileImageUrl,
        },
        { new: true, runValidators: true } 
    ).select('-password'); 

    res.status(200).json(updatedUser);
});

const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide both your old password and new password');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Your old password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
});

const deleteUser = asyncHandler(async (req, res) => {
    // req.user.id is securely provided by the protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Delete the user from the MongoDB database
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ 
        message: 'User account deleted successfully',
        id: req.user.id 
    });
});

// Export all functions securely
export { registerUser, loginUser, getMe, updateProfile, updatePassword, deleteUser };