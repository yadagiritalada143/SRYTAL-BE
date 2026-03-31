"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_connection_string = process.env.DB_CONNECTION_STRING || '';
const db_options = {
    dbName: process.env.DB_NAME || '',
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority',
    heartbeatFrequencyMS: 10000,
};
let isConnected = false;
const connectToDb = async () => {
    if (isConnected) {
        console.warn('[MongoDB] Using existing connection');
        return;
    }
    if (mongoose_1.default.connection.readyState === 1) {
        isConnected = true;
        console.warn('[MongoDB] Already connected');
        return;
    }
    try {
        const startTime = Date.now();
        await mongoose_1.default.connect(db_connection_string, db_options);
        isConnected = true;
        const connectionTime = Date.now() - startTime;
        console.warn(`[MongoDB] Connected successfully in ${connectionTime}ms`);
        const db = mongoose_1.default.connection;
        db.on('error', (error) => {
            console.error('[MongoDB] Connection error:', error);
            isConnected = false;
        });
        db.on('disconnected', () => {
            console.warn('[MongoDB] Disconnected');
            isConnected = false;
        });
        db.on('reconnected', () => {
            console.warn('[MongoDB] Reconnected');
            isConnected = true;
        });
    }
    catch (err) {
        console.error('[MongoDB] Failed to connect:', err);
        isConnected = false;
        throw err;
    }
};
exports.default = connectToDb;
