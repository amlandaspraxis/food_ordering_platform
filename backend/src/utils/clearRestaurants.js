const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User').default;
const Restaurant = require('../models/Restaurant').default;
const FoodItem = require('../models/FoodItem').default;
const Order = require('../models/Order').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery';

async function clearRestaurants() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        console.log('Purging dummy data...');

        // Delete all food items
        const foodResult = await FoodItem.deleteMany({});
        console.log(`✅ Deleted ${foodResult.deletedCount} food items`);

        // Delete all restaurants
        const restaurantResult = await Restaurant.deleteMany({});
        console.log(`✅ Deleted ${restaurantResult.deletedCount} restaurants`);

        // Delete all restaurant owners
        const ownerResult = await User.deleteMany({ role: 'restaurant_owner' });
        console.log(`✅ Deleted ${ownerResult.deletedCount} restaurant owner accounts`);

        // Delete all orders (as they are tied to deleted restaurants/items)
        const orderResult = await Order.deleteMany({});
        console.log(`✅ Deleted ${orderResult.deletedCount} orders`);

        console.log('✨ Database cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

clearRestaurants();
