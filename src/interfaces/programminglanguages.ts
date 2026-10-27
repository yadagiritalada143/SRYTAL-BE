import { Document } from "mongoose";

export interface IProgramminglanguages extends Document {
    languageName: string;
    canonicalKey: string;
    wandboxLabel: string;
    isActive: boolean;
    isExecutable: boolean;
    displayOrder?: number;
    createdAt?: Date;
    updatedAt?: Date;
}