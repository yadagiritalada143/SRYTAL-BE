import { Document } from "mongoose";

interface IDepartment extends Document {
    departmentName: string;
}

export interface FetchAllDepartmentsResponse {
    success: boolean;
    departmentResponse: any;
}

export interface deleteDepartmentResponse {
    success: boolean;
    responseAfterDelete?: any;
};

export default IDepartment;
