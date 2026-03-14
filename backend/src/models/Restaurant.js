"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RestaurantSchema = new mongoose_1.Schema({
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    banner: { type: String },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    cuisines: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    licenseStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revoked'],
        default: 'pending',
    },
    licenseRejectionReason: { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    gst: { type: String },
    openingHours: {
        monday: { open: { type: String }, close: { type: String } },
        tuesday: { open: { type: String }, close: { type: String } },
        wednesday: { open: { type: String }, close: { type: String } },
        thursday: { open: { type: String }, close: { type: String } },
        friday: { open: { type: String }, close: { type: String } },
        saturday: { open: { type: String }, close: { type: String } },
        sunday: { open: { type: String }, close: { type: String } },
    },
    isCurrentlyOpen: { type: Boolean, default: true },
    holidays: [{ type: Date }],
    deliveryFee: { type: Number, default: 0 },
    deliveryTime: { type: Number, default: 30 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Restaurant', RestaurantSchema);
