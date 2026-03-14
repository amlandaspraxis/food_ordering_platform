"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReview = exports.getMyOrders = exports.placeOrder = exports.getAllFoodItems = exports.getRestaurantMenu = exports.getRestaurantById = exports.getRestaurants = exports.updateProfile = exports.getProfile = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const FoodItem_1 = __importDefault(require("../models/FoodItem"));
const Order_1 = __importDefault(require("../models/Order"));
const errorHandler_2 = require("../middleware/errorHandler");
const User_1 = __importDefault(require("../models/User"));
const mongoose = __importDefault(require("mongoose"));
// Get user profile
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.userId).select('-password');
    if (!user) throw new errorHandler_2.ApiError(404, 'User not found');
    res.status(200).json({ success: true, data: user });
});
// Update user profile
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, phone, address } = req.body;
    const user = await User_1.default.findByIdAndUpdate(
        req.userId,
        { name, phone, address },
        { new: true, runValidators: true }
    ).select('-password');
    if (!user) throw new errorHandler_2.ApiError(404, 'User not found');
    res.status(200).json({ success: true, data: user });
});
// Get all approved restaurants
exports.getRestaurants = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const restaurants = await Restaurant_1.default.find({ licenseStatus: 'approved' });
    res.status(200).json({
        success: true,
        data: restaurants,
    });
});
// Get restaurant by ID
exports.getRestaurantById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!mongoose.default.Types.ObjectId.isValid(req.params.id)) {
        throw new errorHandler_2.ApiError(404, 'Invalid restaurant ID');
    }
    const restaurant = await Restaurant_1.default.findById(req.params.id);
    if (!restaurant) {
        throw new errorHandler_2.ApiError(404, 'Restaurant not found');
    }
    res.status(200).json({
        success: true,
        data: restaurant,
    });
});
// Get menu for a restaurant
exports.getRestaurantMenu = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const foodItems = await FoodItem_1.default.find({
        restaurantId: req.params.id,
        isAvailable: true
    });
    res.status(200).json({
        success: true,
        data: foodItems,
    });
});
// Get all available food items globally
exports.getAllFoodItems = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // We only want items from approved restaurants
    const approvedRestaurants = await Restaurant_1.default.find({ licenseStatus: 'approved' }).select('_id');
    const restaurantIds = approvedRestaurants.map(r => r._id);

    // Fetch popular/available items from those restaurants
    const foodItems = await FoodItem_1.default.find({
        restaurantId: { $in: restaurantIds },
        isAvailable: true
    })
        .populate('restaurantId', 'name rating deliveryTime deliveryFee isCurrentlyOpen')
        .sort({ rating: -1, reviewCount: -1 }) // Sort by most popular
        .limit(50); // Get top 50 to spread across categories

    res.status(200).json({
        success: true,
        count: foodItems.length,
        data: foodItems,
    });
});
// Place an order
exports.placeOrder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { items, deliveryAddress, paymentMethod, totalAmount, restaurantId } = req.body;
    if (!items || items.length === 0) {
        throw new errorHandler_2.ApiError(400, 'Order must contain at least one item');
    }
    const order = await Order_1.default.create({
        userId: req.userId,
        restaurantId: restaurantId || items[0].restaurantId,
        items: items.map((item) => ({
            foodId: item.foodId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
        deliveryAddress,
        paymentMethod,
        subtotal: totalAmount,
        totalAmount,
        status: 'pending',
        paymentStatus: paymentMethod === 'online_mock' ? 'completed' : 'pending',
    });
    res.status(201).json({
        success: true,
        data: order,
    });
});
// Get customer orders
exports.getMyOrders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const orders = await Order_1.default.find({ userId: req.userId })
        .populate('restaurantId', 'name image')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: orders,
    });
});
// Get single order by ID (for receipt/tracking)
exports.getOrderById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await Order_1.default.findOne({ _id: req.params.id, userId: req.userId })
        .populate('restaurantId', 'name image phone address');
    if (!order) throw new errorHandler_2.ApiError(404, 'Order not found');
    res.status(200).json({ success: true, data: order });
});
// Submit a review for a restaurant
exports.submitReview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { restaurantId, rating, comment } = req.body;
    if (!restaurantId || !rating) {
        throw new errorHandler_2.ApiError(400, 'Restaurant ID and rating are required');
    }
    const restaurant = await Restaurant_1.default.findById(restaurantId);
    if (!restaurant) throw new errorHandler_2.ApiError(404, 'Restaurant not found');
    const newCount = restaurant.reviewCount + 1;
    const newRating = ((restaurant.rating * restaurant.reviewCount) + rating) / newCount;
    restaurant.rating = Math.round(newRating * 10) / 10;
    restaurant.reviewCount = newCount;
    await restaurant.save();
    res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: { rating: restaurant.rating, reviewCount: restaurant.reviewCount }
    });
});
