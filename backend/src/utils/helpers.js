"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.formatErrorResponse = exports.formatSuccessResponse = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));

/**
 * Format a success response
 */
const formatSuccessResponse = (data, message = 'Success') => {
    return {
        success: true,
        message,
        data,
    };
};
exports.formatSuccessResponse = formatSuccessResponse;

/**
 * Format an error response
 */
const formatErrorResponse = (message = 'Internal Server Error', statusCode = 500) => {
    return {
        success: false,
        message,
        statusCode,
    };
};
exports.formatErrorResponse = formatErrorResponse;

/**
 * Generate a JWT token
 */
const generateToken = (payload, expiresIn = '1d') => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn });
};
exports.generateToken = generateToken;
