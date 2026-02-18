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
    feedbackAttributeResponse: any;
}

 export interface DeleteFeedBackAttributeByAdminResponse {
    success: boolean;
    responseAfterDelete?: any;
 };

export default IFeedbackAttributes;
