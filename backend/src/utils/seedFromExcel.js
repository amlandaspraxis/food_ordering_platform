const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User').default;
const Restaurant = require('../models/Restaurant').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery';

const seedFromExcel = async () => {
    try {
        console.log('Reading extracted Excel data...');
        const rawData = fs.readFileSync(path.join(__dirname, '../../../temp_excel_data_clean.json'), 'utf8');
        const restaurantData = JSON.parse(rawData);
        console.log(`Found ${restaurantData.length} records.`);

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // We use the same salt for all passwords for efficiency during seeding
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = '123456';
        const hashedDefaultPassword = await bcrypt.hash(defaultPassword, salt);

        let successCount = 0;
        let errorCount = 0;

        for (const entry of restaurantData) {
            try {
                const name = entry["Full Name of Restaurant"];
                const email = entry["Email Address"];
                const phone = entry["Phone Number"] ? entry["Phone Number"].toString() : '0000000000';
                const street = entry["Street Address"];
                const city = entry["City"];
                const state = entry["State"];
                const zipCode = entry["Zip Code"] ? entry["Zip Code"].toString() : '000000';

                // Check if user already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    console.log(`⚠️ User ${email} already exists, skipping.`);
                    continue;
                }

                // Create User (Owner)
                const owner = await User.create({
                    name: name,
                    email: email,
                    password: hashedDefaultPassword, // bcrypt middleware in User.js will hash it again if we don't handle it
                    // Actually, User.js has a pre-save hook. If we pass the plain text '123456', it will be hashed.
                    // Let's pass '123456' to let the model handle consistency.
                    password: defaultPassword,
                    phone: phone,
                    role: 'restaurant_owner',
                    isVerified: true,
                    address: {
                        street: street,
                        city: city,
                        zipCode: zipCode,
                        country: 'India'
                    }
                });

                // Create Restaurant
                await Restaurant.create({
                    ownerId: owner._id,
                    name: name,
                    description: `${name} is a premier dining destination in ${city}, ${state}.`,
                    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070', // Default high-quality placeholder
                    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070',
                    address: {
                        street: street,
                        city: city,
                        zipCode: zipCode
                    },
                    phone: phone,
                    email: email,
                    cuisines: ['Indian', 'Local Content'],
                    licenseNumber: `LIC-${entry["#"] || Math.floor(Math.random() * 1000000)}`,
                    licenseStatus: 'approved',
                    isActive: true
                });

                console.log(`✅ Seeded: ${name}`);
                successCount++;
            } catch (err) {
                console.error(`❌ Error seeding entry: ${entry["Full Name of Restaurant"]}`, err.message);
                errorCount++;
            }
        }

        console.log(`\n✨ Seeding Summary:`);
        console.log(`- Success: ${successCount}`);
        console.log(`- Errors: ${errorCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error during seeding:', error);
        process.exit(1);
    }
};

seedFromExcel();
