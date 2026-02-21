const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');


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
    // req.user.id comes from your protect middleware!
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // If the user uploaded a file, Multer puts the Cloudinary URL in req.file.path
    let profileImageUrl = user.profilePic; // Keep existing pic by default
    if (req.file) {
        profileImageUrl = req.file.path; 
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            username: req.body.username || user.username,
            location: req.body.location || user.location,
            profilePic: profileImageUrl,
        },
        { new: true, runValidators: true } // Return the updated document
    ).select('-password'); // Don't send back the password hash

    res.status(200).json(updatedUser);
});

const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    // 1. Validation: Ensure they provided both fields
    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide both your old password and new password');
    }

    // 2. Security Check: Verify the old password matches the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Your old password is incorrect');
    }

    // 3. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update and save
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
});

module.exports = { registerUser, loginUser, getMe, updateProfile, updatePassword };