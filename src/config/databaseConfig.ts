import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const db_connection_string = process.env.DB_CONNECTION_STRING || '';

const db_options = {
    dbName: process.env.DB_NAME || '',
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority' as const,
    heartbeatFrequencyMS: 10000,
};

let isConnected = false;

const connectToDb = async (): Promise<void> => {
    if (isConnected) {
        console.warn('[MongoDB] Using existing connection');
        return;
    }

    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        console.warn('[MongoDB] Already connected');
        return;
    }

    try {
        const startTime = Date.now();

        await mongoose.connect(db_connection_string, db_options);

        isConnected = true;
        const connectionTime = Date.now() - startTime;
        console.warn(`[MongoDB] Connected successfully in ${connectionTime}ms`);

        const db = mongoose.connection;

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

    } catch (err) {
        console.error('[MongoDB] Failed to connect:', err);
        isConnected = false;
        throw err;
    }
};

export default connectToDb;
