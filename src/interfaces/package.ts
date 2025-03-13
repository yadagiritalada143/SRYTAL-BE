import { Document } from 'mongoose';

export interface IPackage extends Document {
    id?: number;
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
}
