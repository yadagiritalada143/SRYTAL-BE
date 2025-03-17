import { Document } from 'mongoose';

export interface ITask extends Document {
    taskTitle?: string;   
}
