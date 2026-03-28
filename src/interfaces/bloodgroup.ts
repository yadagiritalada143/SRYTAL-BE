import { Document } from 'mongoose';

export interface IBloodgroup extends Document {
  type: string;
}

export interface IFetchBloodGroupDetailsResponse {
  success: boolean;
  bloodGroupList?: any;
}

export interface IUpdateBloodGroupResponse {
  success: boolean;
  responseAfterupdate?: any;
}
