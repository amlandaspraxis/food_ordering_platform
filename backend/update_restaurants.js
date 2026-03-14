const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const RestaurantSchema = new mongoose.Schema({
    isCurrentlyOpen: { type: Boolean, default: true },
}, { strict: false });

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

async function update() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const result = await Restaurant.updateMany({}, { isCurrentlyOpen: true });
        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

update();
