import { Document } from 'mongoose';

export interface ITask extends Document {
    // packageId?:string;
    takeTitle?: string;
    
}
