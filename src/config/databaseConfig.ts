import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const db_connection_string = process.env.DB_CONNECTION_STRING || '';
const db_options = {
    dbName: process.env.DB_NAME || ''
};

mongoose.connect(db_connection_string, db_options)
    .then(() => console.warn('MongoDB connection successfully !'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

const connectToDb = () => {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.warn('Connected to MongoDB !!');
    });
}

export default connectToDb;
