import { Document } from "mongoose";

export interface IDepartment extends Document {
    departmentName: string;
}

export interface FetchDepartmentsResponse {
    success: boolean;
    departments?: any;
}
export interface updateDepartmentResponse {
    success: boolean;
    departmentResponse: any;
}

export interface deleteDepartmentResponse {
    success: boolean;
    responseAfterDelete?: any;
};
