import mongoose, { Document } from "mongoose";
import BankDetailsInfo from '../types/bankDetailsInfo';

// interface IUser extends Document {
//     id: number;
//     firstName: string;
//     lastName: string;
//     password?: string;
//     email: string;
//     mobileNumber: number;
//     userRole?: string;
//     passwordResetRequired?: boolean;
//     bankDetailsInfo?: BankDetailsInfo;
//     profileImage: string;
//     bloodGroup?: mongoose.Schema.Types.ObjectId;
//     employmentType?: mongoose.Schema.Types.ObjectId;
//     employeeRole?: mongoose.Schema.Types.Array;
//     organization?: mongoose.Schema.Types.ObjectId;
// };
// Example of IUser interface definition
export default interface IUser {
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    bloodGroup: string;
    bankDetailsInfo: {
        accountNumber: string;
        bankName: string;
    };
    employmentType: string;
    employeeRole: string;
    organization: string;
}



// export default IUser;
