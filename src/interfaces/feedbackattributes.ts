import mongoose, { Document } from 'mongoose';

interface IFeedbackAttributes extends Document {
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface updateFeedbackAttributeResponse {
    success: boolean;
    responseAfterupdate?: any;
}

export interface FetchAllFeedbackAttributes {
    success: boolean;
    feedbackAttributeResponse: any;
}

 export interface DeleteFeedbackAttributeByAdminResponse {
    success: boolean;
    responseAfterDelete?: any;
 };

export default IFeedbackAttributes;
