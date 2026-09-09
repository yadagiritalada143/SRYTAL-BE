import mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IUserOpenRouterKey extends Document {
    userId: mongoose.Types.ObjectId | string;
    openrouterKey: string;
    createdAt?: Date;
    updatedAt?: Date;
};
