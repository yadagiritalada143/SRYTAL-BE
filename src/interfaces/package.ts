import mongoose, { Document, ObjectId } from 'mongoose';

export interface IPackage extends Document {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  approvers?: mongoose.Schema.Types.Array;
}

export interface FetchPackagesDetailsResponse {
  success: boolean;
  packageDetails?: any;
}

export interface IEmployeePackage {
  employeeId: ObjectId;
  packages: {
    packageId: ObjectId;
    tasks: {
      taskId: ObjectId;
      startDate: Date;
    }[];
  }[];
}

export interface IDeleteEmployeePackagesResponse {
  success: boolean;
  responseAfterDelete?: any;
}

export interface IFetchPackagesAndTasksResponse {
  success: boolean;
  packagesList?: any[];
}

export interface IUpdatePackageResponse {
  success: boolean;
  responseAfterUpdate?: any;
}
