import { Document } from 'mongoose';

export interface IPackage extends Document {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
}
