import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/User.js'; 

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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

const googleAuth = asyncHandler(async (req, res) => {
    const { googleAccessToken } = req.body;

    const googleResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );

    const { email, name, picture } = googleResponse.data;

    let user = await User.findOne({ email });

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

// --- FIXED: Wrapped in asyncHandler, removed inline export ---
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, an email was sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You requested a password reset. \n\nPlease go to this link to reset your password: \n\n${resetUrl} \n\nIf you didn't request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SwapNest - Password Reset Token',
        message: message,
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

// --- FIXED: Added bcrypt hashing for the new password ---
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

    // --- CRITICAL FIX: Hash the newly provided password before saving ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword; 
    
    // Clear the temporary token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

// Export all functions securely at the bottom
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