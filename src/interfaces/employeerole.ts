import { Document } from 'mongoose';

export interface IEmployeerole extends Document {
  employeerole: string;
}

export interface IDeleteEmployeeRoleResponse {
  success: boolean;
  responseAfterDelete?: any;
}

export interface IFetchEmployeeRolesResponse {
  success: boolean;
  employeeRoles?: any;
}

export interface IUpdateEmployeeRoleResponse {
  success: boolean;
  responseAfterUpdate?: any;
}
