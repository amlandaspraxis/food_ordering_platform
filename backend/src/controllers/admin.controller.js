"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = exports.adminLogin = exports.respondToComplaint = exports.getComplaints = exports.updateLicenseStatus = exports.getAllRestaurants = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middleware/errorHandler");
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const User_1 = __importDefault(require("../models/User"));
const Complaint_1 = __importDefault(require("../models/Complaint"));
const errorHandler_2 = require("../middleware/errorHandler");
// Get all restaurants (including pending)
exports.getAllRestaurants = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const restaurants = await Restaurant_1.default.find().populate('ownerId', 'name email');
    res.status(200).json({
        success: true,
        data: restaurants,
    });
});
// Approve/Reject restaurant license
exports.updateLicenseStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, remarks } = req.body;
    const restaurant = await Restaurant_1.default.findByIdAndUpdate(req.params.id, { licenseStatus: status }, { new: true });
    if (!restaurant)
        throw new errorHandler_2.ApiError(404, 'Restaurant not found');
    res.status(200).json({
        success: true,
        message: `Restaurant ${status}`,
        data: restaurant,
    });
});
// Manage Complaints
exports.getComplaints = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const complaints = await Complaint_1.default.find()
        .populate('customer', 'name email')
        .populate('restaurant', 'name')
        .populate('order', 'orderNumber');
    res.status(200).json({
        success: true,
        data: complaints,
    });
});
// Respond to Complaint
exports.respondToComplaint = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { response, status } = req.body;
    const complaint = await Complaint_1.default.findByIdAndUpdate(req.params.id, { adminResponse: response, status }, { new: true });
    if (!complaint)
        throw new errorHandler_2.ApiError(404, 'Complaint not found');
    res.status(200).json({
        success: true,
        data: complaint,
    });
});
// Admin Login
exports.adminLogin = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(200).json({
            success: true,
            message: 'Admin authentication successful',
            token,
        });
    }
    else {
        throw new errorHandler_2.ApiError(401, 'Invalid admin credentials');
    }
});
// Platform Stats
exports.getPlatformStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const [customerCount, restaurantCount, pendingLicenses, activeComplaints] = await Promise.all([
        User_1.default.countDocuments({ role: 'customer' }),
        Restaurant_1.default.countDocuments({ licenseStatus: 'approved' }),
        Restaurant_1.default.countDocuments({ licenseStatus: 'pending' }),
        Complaint_1.default.countDocuments({ status: { $ne: 'resolved' } }),
    ]);
    res.status(200).json({
        success: true,
        data: {
            customers: customerCount,
            restaurants: restaurantCount,
            pendingLicenses,
            activeComplaints,
        },
    });
});
