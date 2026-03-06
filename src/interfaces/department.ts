import { Document } from "mongoose";

interface IDepartment extends Document {
    departmentName: string;
}
export default IDepartment;
