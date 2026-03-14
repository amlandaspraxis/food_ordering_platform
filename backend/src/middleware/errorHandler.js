"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    message;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[ERROR] ${statusCode}: ${message}`);
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
