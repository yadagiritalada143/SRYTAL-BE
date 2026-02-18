import mongoose, { Document } from 'mongoose';

interface IFeedbackAttributes extends Document {

    name: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export default IFeedbackAttributes;
