const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User').default;
const Restaurant = require('../models/Restaurant').default;
const FoodItem = require('../models/FoodItem').default;

dotenv.config();

const restaurants = [
    {
        name: "Lumina Grill",
        email: "owner1@luminagrill.com",
        password: "password123",
        phone: "9876543210",
        description: "Modern European cuisine with a touch of elegance. Experience the finest grilled delicacies in a sophisticated atmosphere.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070",
        banner: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070",
        address: { street: "12 Carbon Avenue", city: "Metropolis", zipCode: "560001" },
        cuisines: ["European", "Grill", "Fine Dining"],
        rating: 4.8,
        reviewCount: 156,
        licenseNumber: "LIC-LUMINA-001",
        deliveryFee: 5.0,
        deliveryTime: 45,
        isCurrentlyOpen: true,
        menu: [
            { name: "Wagyu Steak", description: "Premium A5 Wagyu served with truffle mash", price: 85, category: "Mains", isVegetarian: false },
            { name: "Lobster Bisque", description: "Creamy lobster soup with brandy", price: 24, category: "Starters", isVegetarian: false },
            { name: "Truffle Risotto", description: "Wild mushrooms and fresh truffles", price: 32, category: "Mains", isVegetarian: true }
        ]
    },
    {
        name: "Sakura Zen",
        email: "owner2@sakurazen.com",
        password: "password123",
        phone: "9876543211",
        description: "Authentic Japanese dining experience. From fresh sashimi to handcrafted ramen, every dish tells a story of tradition.",
        image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=2070",
        banner: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=2070",
        address: { street: "45 Sakura Street", city: "Metropolis", zipCode: "560002" },
        cuisines: ["Japanese", "Sushi", "Ramen"],
        rating: 4.9,
        reviewCount: 230,
        licenseNumber: "LIC-SAKURA-002",
        deliveryFee: 3.5,
        deliveryTime: 30,
        isCurrentlyOpen: true,
        menu: [
            { name: "Dragon Roll", description: "Shrimp tempura and avocado topped with eel", price: 18, category: "Sushi", isVegetarian: false },
            { name: "Tonkotsu Ramen", description: "12-hour pork broth with chashu", price: 16, category: "Ramen", isVegetarian: false },
            { name: "Miso Glazed Tofu", description: "Caramelized tofu with ginger", price: 12, category: "Appetizers", isVegetarian: true }
        ]
    },
    {
        name: "Spice Route Fusion",
        email: "owner3@spiceroute.com",
        password: "password123",
        phone: "9876543212",
        description: "A vibrant fusion of traditional Indian spices and global flavors. Bold, colorful, and utterly delicious.",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2070",
        banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070",
        address: { street: "88 Saffron Lane", city: "Metropolis", zipCode: "560003" },
        cuisines: ["Indian", "Fusion", "Spicy"],
        rating: 4.7,
        reviewCount: 189,
        licenseNumber: "LIC-SPICE-003",
        deliveryFee: 2.0,
        deliveryTime: 25,
        isCurrentlyOpen: true,
        menu: [
            { name: "Butter Chicken Tacos", description: "Tender chicken in makhani gravy inside corn tortillas", price: 14, category: "Fusion", isVegetarian: false },
            { name: "Paneer Tikka Platter", description: "Grilled cottage cheese with mint chutney", price: 16, category: "Starters", isVegetarian: true },
            { name: "Mango Lassi Cheesecake", description: "Refreshing fusion dessert", price: 9, category: "Desserts", isVegetarian: true }
        ]
    },
    {
        name: "Azure Wharf",
        email: "owner4@azurewharf.com",
        password: "password123",
        phone: "9876543213",
        description: "Fresh seafood caught daily and prepared with Mediterranean flair. Enjoy the ocean's bounty in every bite.",
        image: "https://images.unsplash.com/photo-1551731359-2b3ca7609a47?q=80&w=2070",
        banner: "https://images.unsplash.com/photo-1544628230-8fd27a51a4a4?q=80&w=2070",
        address: { street: "1 Marina Way", city: "Coastal City", zipCode: "400001" },
        cuisines: ["Seafood", "Mediterranean", "Fine Dining"],
        rating: 4.6,
        reviewCount: 95,
        licenseNumber: "LIC-AZURE-004",
        deliveryFee: 8.0,
        deliveryTime: 50,
        isCurrentlyOpen: true,
        menu: [
            { name: "Grilled Branzino", description: "Whole sea bass with lemon and herbs", price: 34, category: "Mains", isVegetarian: false },
            { name: "Calamari Fritti", description: "Crispy squid with spicy marinara", price: 15, category: "Appetizers", isVegetarian: false },
            { name: "Seafood Paella", description: "Traditional Spanish rice with shellfish", price: 42, category: "Large Plates", isVegetarian: false }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        // await FoodItem.deleteMany({});
        // await Restaurant.deleteMany({});
        // await User.deleteMany({ role: 'restaurant_owner' });
        // NOTE: We don't delete everything if the user has existing data they want to keep, 
        // but the user asked for "modern mockup data like now", so we will provide NEW ones.

        for (const data of restaurants) {
            // Check if user already exists
            let owner = await User.findOne({ email: data.email });
            if (!owner) {
                owner = await User.create({
                    name: data.name + ' Owner',
                    email: data.email,
                    password: data.password,
                    phone: data.phone,
                    role: 'restaurant_owner',
                    address: data.address
                });
            }

            // Check if restaurant already exists
            let restaurant = await Restaurant.findOne({ licenseNumber: data.licenseNumber });
            if (!restaurant) {
                restaurant = await Restaurant.create({
                    ownerId: owner._id,
                    name: data.name,
                    description: data.description,
                    image: data.image,
                    banner: data.banner,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    cuisines: data.cuisines,
                    rating: data.rating,
                    reviewCount: data.reviewCount,
                    licenseNumber: data.licenseNumber,
                    deliveryFee: data.deliveryFee,
                    deliveryTime: data.deliveryTime,
                    licenseStatus: 'approved',
                    isCurrentlyOpen: data.isCurrentlyOpen
                });

                // Add menu items
                for (const menuData of data.menu) {
                    await FoodItem.create({
                        restaurantId: restaurant._id,
                        ...menuData
                    });
                }
            } else {
                console.log(`Restaurant ${data.name} already exists. Skipping.`);
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
