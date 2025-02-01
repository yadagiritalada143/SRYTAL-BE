import { DateTime } from "aws-sdk/clients/devicefarm";
import mongoose, { Document } from "mongoose";

export interface ITalentPoolCandidates extends Document {
    id: Object;
    candidateName: string;
    contact: {
        email: string;
        phone: string;
    };
    totalYearsOfExperience: number;
    relaventYearsOfExperience: number;
    comments?: {
        sort(arg0: (a: any, b: any) => number): unknown;
        comment?: string;
        callStartsAt?: DateTime;
        callEndsAt?: DateTime;
        userId?: mongoose.Schema.Types.ObjectId;
        updateAt?: Date;
    },
    createdAt: Date;
    lastUpdatedAt: Date;
}
