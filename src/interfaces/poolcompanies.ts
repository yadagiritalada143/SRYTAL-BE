import mongoose, { Document } from 'mongoose';

export interface IPoolcompanies extends Document {
  id: Object;
  companyName: string;
  primaryContact: {
    name?: string;
    email?: string;
    phone?: string;
  };
  secondaryContact_1: {
    name?: string;
    email?: string;
    phone?: string;
  };
  secondaryContact_2: {
    name?: string;
    email?: string;
    phone?: string;
  };
  status?: string;
  comments?: {
    sort(arg0: (a: any, b: any) => number): unknown;
    comment?: string;
    userId?: mongoose.Schema.Types.ObjectId;
    updateAt?: Date;
  };
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface IPoolCompaniesResponse extends IPoolcompanies {
  success: boolean;
  poolCompaniesResponse?: Array<IPoolcompanies>;
}

export interface IPoolCompanyResponse extends IPoolcompanies {
  success: boolean;
  poolCompanyResponse?: IPoolcompanies;
}

export interface IDeletePoolCompanyResponse {
  success: boolean;
}
