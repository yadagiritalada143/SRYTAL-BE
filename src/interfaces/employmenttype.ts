import { Document } from "mongoose";

export interface IEmploymenttype extends Document {
    employmentType: string;
}

export interface IDeleteEmploymentTypeResponse {
    success: boolean;
    responseAfterDelete?: any;
}

export interface IFetchEmploymentTypeResponse {
    success: boolean;
    employmentTypesList?: any;
}

export interface IUpdateEmploymentTypeResponse {
    success: boolean;
    responseAfterUpdate?: any;
}
