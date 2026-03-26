import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js'; // Must include .js extension!

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = asyncHandler(async (req, res) => {
    // 1. Extract 'role' from the request body
    const { username, email, password, role } = req.body;

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

    // 2. Pass the role into the database creation
    const user = await User.create({ 
        username, 
        email, 
        password: hashedPassword,
        role: role || 'user' // Uses the provided role, or defaults to 'user'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role, // 3. Send the role back in the response
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
            // --- WE SWAPPED LOCATION FOR BIO HERE ---
            bio: req.body.bio !== undefined ? req.body.bio : user.bio, 
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
    // 1. Find the user by the ID passed in the URL
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // 2. Delete that specific user from the database
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
        message: 'User account deleted successfully',
        deletedUserId: req.params.id 
    });
});

const logoutUser = asyncHandler(async (req, res) => {
    // req.user is provided by your 'protect' middleware
    const user = await User.findById(req.user.id);

    if (user) {
        // Destroy the token in the database
        user.activeToken = null; 
        await user.save();
        
        res.status(200).json({ message: 'Successfully logged out.' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- NEW GOOGLE AUTH CONTROLLER ---
const googleAuth = asyncHandler(async (req, res) => {
    const { googleAccessToken } = req.body;

    // 1. Ask Google for the user's details using their access token
    const googleResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );

    const { email, name, picture } = googleResponse.data;

    // 2. Check if this user already exists in SwapNest
    let user = await User.findOne({ email });

    // 3. If they don't exist, REGISTER them!
    if (!user) {
        // Generate a random secure password since they use Google to log in
        const randomPassword = Math.random().toString(36).slice(-12);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = await User.create({
            username: name,
            email: email,
            password: hashedPassword,
            profilePic: picture, // We even grab their Google profile picture!
            role: 'user'
        });
    }

    // 4. Generate a SwapNest Token & Set Active Session
    const token = generateToken(user._id);
    user.activeToken = token;
    await user.save();

    // 5. Send them into the app
    res.status(200).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        token: token,
    });
});

// Export all functions securely
export { registerUser, loginUser, getMe, updateProfile, updatePassword, deleteUser, logoutUser, googleAuth };