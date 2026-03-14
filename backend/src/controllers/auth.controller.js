"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const generateTokens = (userId, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRE || '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' });
    return { accessToken, refreshToken };
};
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, phone, role, address } = req.body;
    // Validation
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user exists
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
    }
    // Create new user
    const user = new User_1.default({
        name,
        email,
        password,
        phone,
        role: role || 'customer',
        address: address || {},
        isVerified: true, // Mock verification
    });
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
        message: 'Registration successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token: accessToken,
        refreshToken,
    });
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User_1.default.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token: accessToken,
        refreshToken,
    });
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logout successful' });
});
exports.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET || 'secret');
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.role);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken });
    }
    catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
});
