import { Document } from "mongoose";

export interface IProgramminglanguages extends Document {
    languageName: string;
    createdAt?: Date;
    updatedAt?: Date;
}
