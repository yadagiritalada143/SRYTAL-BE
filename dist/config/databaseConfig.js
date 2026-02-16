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
    dbName: process.env.DB_NAME || ''
};
mongoose_1.default.connect(db_connection_string, db_options)
    .then(() => console.warn('MongoDB connection successfully !'))
    .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
const connectToDb = () => {
    const db = mongoose_1.default.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.warn('Connected to MongoDB !!');
    });
};
exports.default = connectToDb;
