import { Document } from "mongoose";

interface IDepartment extends Document {
    departmentName: string;
}

export interface FetchAllDepartmentsResponse {
    success: boolean;
    departmentResponse: any;
}
export interface updateDepartmentResponse {
    success: boolean;
    departmentResponse: any;
}

export default IDepartment;
