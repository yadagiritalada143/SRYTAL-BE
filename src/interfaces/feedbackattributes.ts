import mongoose, { Document } from 'mongoose';

interface IFeedbackAttributes extends Document {
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface updateFeedBackAttributeResponse {
    success: boolean;
    responseAfterupdate?: any;
}

export interface FetchAllFeedBackAttributes {
    success: boolean;
    feedbackAttributeRepository: any;
}

export default IFeedbackAttributes;
