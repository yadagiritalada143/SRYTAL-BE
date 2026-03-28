export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  id?: string;
  userRole?: string;
  token?: string;
  passwordResetRequired?: string;
  applicationWalkThrough?: number;
  firstName?: string;
  lastName?: string;
  refreshToken?: string;
}
