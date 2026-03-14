"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getRestaurantOrders = exports.updateMenuItem = exports.addMenuItem = exports.getMenuItems = exports.updateRestaurantProfile = exports.getMyRestaurant = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const FoodItem_1 = __importDefault(require("../models/FoodItem"));
const Order_1 = __importDefault(require("../models/Order"));
const errorHandler_2 = require("../middleware/errorHandler");
// Get restaurant profile (for the logged in owner)
exports.getMyRestaurant = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const restaurant = await Restaurant_1.default.findOne({ ownerId: userId });
    if (!restaurant) {
        throw new errorHandler_2.ApiError(404, 'Restaurant not found for this user');
    }
    res.status(200).json({
        success: true,
        data: restaurant,
    });
});
// Create/Update restaurant profile
exports.updateRestaurantProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    let restaurant = await Restaurant_1.default.findOne({ ownerId: userId });
    const updateData = { ...req.body };
    if (req.file) {
        updateData.image = req.file.path;
    }
    if (restaurant) {
        restaurant = await Restaurant_1.default.findByIdAndUpdate(restaurant._id, { ...updateData, ownerId: userId }, { new: true, runValidators: true });
    }
    else {
        restaurant = await Restaurant_1.default.create({
            ...updateData,
            ownerId: userId,
        });
    }
    res.status(200).json({
        success: true,
        data: restaurant,
    });
});
// Get menu items for the logged-in restaurant owner
exports.getMenuItems = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const restaurant = await Restaurant_1.default.findOne({ ownerId: userId });
    if (!restaurant)
        throw new errorHandler_2.ApiError(404, 'Restaurant not found');
    const items = await FoodItem_1.default.find({ restaurantId: restaurant._id });
    res.status(200).json({
        success: true,
        data: items,
    });
});
// Manage Menu Items
exports.addMenuItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const restaurant = await Restaurant_1.default.findOne({ ownerId: userId });
    if (!restaurant)
        throw new errorHandler_2.ApiError(404, 'Restaurant not found');
    const foodData = { ...req.body };
    if (req.file) {
        foodData.image = req.file.path;
    }
    const foodItem = await FoodItem_1.default.create({
        ...foodData,
        restaurantId: restaurant._id,
    });
    res.status(201).json({
        success: true,
        data: foodItem,
    });
});
exports.updateMenuItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const foodItem = await FoodItem_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!foodItem)
        throw new errorHandler_2.ApiError(404, 'Menu item not found');
    res.status(200).json({
        success: true,
        data: foodItem,
    });
});
// Get orders for the restaurant
exports.getRestaurantOrders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const restaurant = await Restaurant_1.default.findOne({ ownerId: userId });
    if (!restaurant)
        throw new errorHandler_2.ApiError(404, 'Restaurant not found');
    const orders = await Order_1.default.find({ restaurantId: restaurant._id })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: orders,
    });
});
// Update order status
exports.updateOrderStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order)
        throw new errorHandler_2.ApiError(404, 'Order not found');
    res.status(200).json({
        success: true,
        data: order,
    });
});
