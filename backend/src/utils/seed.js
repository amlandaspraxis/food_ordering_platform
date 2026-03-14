const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User').default;
const Restaurant = require('../models/Restaurant').default;
const FoodItem = require('../models/FoodItem').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery';

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({ role: { $in: ['restaurant_owner', 'admin'] } });
        await Restaurant.deleteMany({});
        await FoodItem.deleteMany({});
        console.log('✅ Data cleared');

        // Create Admin
        const adminSalt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin', adminSalt);
        await User.create({
            name: 'System Admin',
            email: 'admin@admin.com',
            password: adminPassword,
            phone: '9999999999',
            role: 'admin',
            isVerified: true
        });
        console.log('✅ Admin created');

        // Create Owners & Restaurants
        const restaurantData = [
            {
                owner: {
                    name: 'Lucas Skyline',
                    email: 'owner1@test.com',
                    password: 'password123',
                    phone: '8888888881'
                },
                restaurant: {
                    name: 'Skyline Grill & Bar',
                    description: 'Modern rooftop dining with artisanal cocktails and gourmet burgers.',
                    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800',
                    address: { street: '123 Cloud St', city: 'Metropolis', zipCode: '10001' },
                    phone: '555-0101',
                    email: 'contact@skylinegrill.com',
                    cuisines: ['American', 'Steakhouse'],
                    licenseNumber: 'L-100201'
                },
                menu: [
                    { name: 'Truflle Wagyu Burger', description: 'Double wagyu patty, black truffle aioli, aged cheddar.', price: 24, category: 'Main', isVegetarian: false },
                    { name: 'Avocado Toast Deluxe', description: 'Sourdough, poached egg, chili flakes, radish.', price: 16, category: 'Brunch', isVegetarian: true },
                    { name: 'Lobster Mac & Cheese', description: 'Creamy five-cheese blend with fresh Maine lobster.', price: 28, category: 'Sides', isVegetarian: false }
                ]
            },
            {
                owner: {
                    name: 'Mami Sushi',
                    email: 'owner2@test.com',
                    password: 'password123',
                    phone: '8888888882'
                },
                restaurant: {
                    name: 'Neo Sushi Hub',
                    description: 'Contemporary Japanese fusion with a focus on fresh, sustainable seafood.',
                    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
                    address: { street: '456 Neon Way', city: 'Metropolis', zipCode: '10002' },
                    phone: '555-0202',
                    email: 'order@neosushi.com',
                    cuisines: ['Japanese', 'Fusion'],
                    licenseNumber: 'L-100202'
                },
                menu: [
                    { name: 'Spicy Bluefin Tuna Roll', description: 'Avocado, cucumber, spicy mayo, togarashi.', price: 18, category: 'Sushi', isVegetarian: false },
                    { name: 'Truffle Edamame', description: 'Steamed soybeans, sea salt, truffle oil.', price: 9, category: 'Small Plates', isVegetarian: true },
                    { name: 'Dragon Roll', description: 'Shrimp tempura, eel, avocado, kabayaki sauce.', price: 22, category: 'Sushi', isVegetarian: false }
                ]
            },
            {
                owner: {
                    name: 'Marco Italia',
                    email: 'owner@test.com',
                    password: 'password123',
                    phone: '8888888883'
                },
                restaurant: {
                    name: 'Urban Pasta Lab',
                    description: 'Hand-made pasta and wood-fired pizzas in an industrial setting.',
                    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
                    address: { street: '789 Brick Alley', city: 'Metropolis', zipCode: '10003' },
                    phone: '555-0303',
                    email: 'hello@pastalab.com',
                    cuisines: ['Italian', 'Pasta'],
                    licenseNumber: 'L-100203'
                },
                menu: [
                    { name: 'Wild Mushroom Risotto', description: 'Arborio rice, porcini, parmesan, thyme.', price: 21, category: 'Main', isVegetarian: true },
                    { name: 'Diavola Pizza', description: 'Spicy salami, mozzarella, tomato, chili.', price: 19, category: 'Pizza', isVegetarian: false },
                    { name: 'Burrata Salad', description: 'Heirloom tomatoes, basil pesto, balsamic glaze.', price: 15, category: 'Appetizers', isVegetarian: true }
                ]
            },
            {
                owner: {
                    name: 'Sarah Green',
                    email: 'owner4@test.com',
                    password: 'password123',
                    phone: '8888888884'
                },
                restaurant: {
                    name: 'The Green Leaf',
                    description: 'Plant-based cuisine that doesn\'t compromise on flavor.',
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
                    address: { street: '101 Forest Dr', city: 'Metropolis', zipCode: '10004' },
                    phone: '555-0404',
                    email: 'info@greenleaf.com',
                    cuisines: ['Vegan', 'Healthy'],
                    licenseNumber: 'L-100204'
                },
                menu: [
                    { name: 'Beyond Meat Bowl', description: 'Quinoa, kale, roasted sweet potato, tahini.', price: 17, category: 'Bowls', isVegetarian: true },
                    { name: 'Zucchini Noodles', description: 'Raw zucchini, sun-dried tomato pesto, pine nuts.', price: 15, category: 'Pasta', isVegetarian: true },
                    { name: 'Vegan Chocolate Mousse', description: 'Avocado-based, rich cacao, almond crunch.', price: 10, category: 'Dessert', isVegetarian: true }
                ]
            },
            {
                owner: {
                    name: 'Raj Tandoor',
                    email: 'owner5@test.com',
                    password: 'password123',
                    phone: '8888888885'
                },
                restaurant: {
                    name: 'Velvet Spice',
                    description: 'Elevated Indian cuisine with a royal touch.',
                    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f96?auto=format&fit=crop&q=80&w=800',
                    address: { street: '202 Saffron St', city: 'Metropolis', zipCode: '10005' },
                    phone: '555-0505',
                    email: 'spice@velvet.com',
                    cuisines: ['Indian', 'Tandoor'],
                    licenseNumber: 'L-100205'
                },
                menu: [
                    { name: 'Butter Chicken Royale', description: 'Charred chicken, creamy tomato gravy, fenugreek.', price: 20, category: 'Curry', isVegetarian: false },
                    { name: 'Paneer Tikka Platter', description: 'Grilled cottage cheese, mint chutney, slaw.', price: 16, category: 'Appetizers', isVegetarian: true },
                    { name: 'Garlic Naan Basket', description: 'Tandoor-baked with clarified butter and garlic.', price: 6, category: 'Bread', isVegetarian: true }
                ]
            }
        ];

        for (const data of restaurantData) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.owner.password, salt);

            const owner = await User.create({
                ...data.owner,
                password: hashedPassword,
                role: 'restaurant_owner',
                isVerified: true
            });

            const restaurant = await Restaurant.create({
                ...data.restaurant,
                ownerId: owner._id,
                isActive: true,
                licenseStatus: 'approved'
            });

            for (const item of data.menu) {
                await FoodItem.create({
                    ...item,
                    restaurantId: restaurant._id
                });
            }
            console.log(`✅ Seeded: ${restaurant.name}`);
        }

        console.log('✨ All data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
