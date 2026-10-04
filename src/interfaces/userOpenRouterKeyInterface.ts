import mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IUserOpenRouterKey extends Document {
    [x: string]: any;
    userId: mongoose.Types.ObjectId | string;
    openrouterKey: string;
    createdAt?: Date;
    updatedAt?: Date;
};
