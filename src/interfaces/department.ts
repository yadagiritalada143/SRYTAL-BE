import { Document } from "mongoose";

interface IDepartment extends Document {
    departmentName: string;
}

interface FetchDepartmentsResponse {
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

export default IDepartment;
