import mongoose, { Document } from 'mongoose';

interface IFeedbackAttributes extends Document {

    name: string;
    comment?: string;
    rating?: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export default IFeedbackAttributes;
