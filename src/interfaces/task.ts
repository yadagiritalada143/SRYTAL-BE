import { Document } from 'mongoose';

export interface ITask extends Document {
    takeTitle?: string;
    
}
