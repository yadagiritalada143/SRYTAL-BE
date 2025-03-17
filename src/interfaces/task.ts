import { Document } from 'mongoose';

export interface ITask extends Document {
    task?: string;   
}
