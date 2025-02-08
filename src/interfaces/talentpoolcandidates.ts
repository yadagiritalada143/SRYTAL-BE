import mongoose, { Document } from "mongoose";

export interface ITalentPoolCandidates extends Document {
    id: Object;
    candidateName: string;
    contact: {
        email: string;
        phone: string;
    };
    totalYearsOfExperience?: number;
    relaventYearsOfExperience?: number;
    evaluatedSkills?: string;
    comments?: {
        sort(arg0: (a: any, b: any) => number): unknown;
        comment?: string;
        callStartsAt?: Date;
        callEndsAt?: Date;
        userId?: mongoose.Schema.Types.ObjectId;
        updateAt?: Date;
    },
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    lastUpdatedAt: Date;
}
