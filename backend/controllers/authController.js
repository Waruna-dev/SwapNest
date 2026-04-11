import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/User.js'; 

// --- HELPER: GENERATE JWT ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
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

    const user = await User.create({ 
        username, 
        email, 
        password: hashedPassword,
        role: role || 'user' 
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role, 
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // --- NEW: Restrict Admin Login ---
    if (user && user.role === 'admin') {
        res.status(403);
        throw new Error('Administrators are not permitted to log in via the Standard User portal.');
    }

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let profileImageUrl = user.profilePic;
    
    // If a new file was uploaded via Multer, grab its path
    if (req.file) {
        profileImageUrl = req.file.path; 
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            username: req.body.username || user.username,
            email: req.body.email || user.email,
            bio: req.body.bio !== undefined ? req.body.bio : user.bio, 
            profilePic: profileImageUrl,
        },
        { new: true, runValidators: true } 
    ).select('-password'); 

    res.status(200).json(updatedUser);
});

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
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

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
        message: 'User account deleted successfully',
        deletedUserId: req.params.id 
    });
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.activeToken = null; 
        await user.save();
        res.status(200).json({ message: 'Successfully logged out.' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Google OAuth
// @route   POST /api/users/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
    const { googleAccessToken } = req.body;

    const googleResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );

    const { email, name, picture } = googleResponse.data;

    let user = await User.findOne({ email });

    // --- NEW: Restrict Admin Login via Google ---
    if (user && user.role === 'admin') {
        res.status(403);
        throw new Error('Administrators are not permitted to log in via the Standard User portal.');
    }

    if (!user) {
        const randomPassword = Math.random().toString(36).slice(-12);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = await User.create({
            username: name,
            email: email,
            password: hashedPassword,
            profilePic: picture, 
            role: 'user'
        });
    }

    const token = generateToken(user._id);
    user.activeToken = token;
    await user.save();

    res.status(200).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        token: token,
    });
});

// @desc    Request Password Reset Email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
        return res.status(200).json({ message: 'If an account exists, an email was sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

    await user.save();

    // --- DYNAMIC FRONTEND URL ---
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://swapnest-client.onrender.com' 
      : 'http://localhost:5173';
      
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    
    const htmlMessage = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf9; padding: 40px; border-radius: 12px; border: 1px solid #eaeaea;">
        <h1 style="color: #1a1a1a; font-size: 28px; text-align: center; letter-spacing: -0.5px; margin-bottom: 30px;">
          SwapNest
        </h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${user.username},
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset the password for your SwapNest account. Click the button below to choose a new password. This link will expire in 15 minutes.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="background-color: #822800; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #777777; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #822800; font-size: 14px; word-break: break-all; margin-bottom: 40px;">
          ${resetUrl}
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #a3a3a3; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px;">
          © 2026 SwapNest. Circularity by design.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'SwapNest - Password Reset Request',
            html: htmlMessage, 
        });

        res.status(200).json({ message: 'Token sent to email!' });
        
    } catch (emailError) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset Password via Token
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }, 
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword; 
    
    // Clear the temporary token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

export { 
    registerUser, 
    loginUser, 
    getMe, 
    updateProfile, 
    updatePassword, 
    deleteUser, 
    logoutUser, 
    googleAuth, 
    forgotPassword, 
    resetPassword 
};
