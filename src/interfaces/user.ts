import mongoose, { Document } from 'mongoose';
import BankDetailsInfo from '../types/bankDetailsInfo';

interface IUser extends Document {
  id: number;
  firstName: string;
  lastName: string;
  password?: string;
  email: string;
  mobileNumber: number;
  userRole?: string;
  passwordResetRequired?: boolean;
  bankDetailsInfo?: BankDetailsInfo;
  profileImage: string;
  bloodGroup?: mongoose.Schema.Types.ObjectId;
  employmentType?: mongoose.Schema.Types.ObjectId;
  employeeRole?: mongoose.Schema.Types.Array;
  isDeleted?: boolean;
  organization?: mongoose.Schema.Types.ObjectId;
  lastLoggedOn?: Date;
  employeeId?: string;
  aadharNumber: string;
  panCardNumber: string;
  uanNumber?: string;
  dateOfBirth?: Date;
  presentAddress?: string;
  permanentAddress?: string;
  refreshToken?: string;
};

export interface FetchEmployeeDetailsResponse {
  success: boolean;
  usersList?: any;
};

export interface UpdateProfileResponse {
  success: boolean;
};

export default IUser;
