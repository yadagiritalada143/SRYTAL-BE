import mongoose, { Document } from 'mongoose';

export interface IAdminNotification extends Document {
    context: string;
    status: string;
    
}
