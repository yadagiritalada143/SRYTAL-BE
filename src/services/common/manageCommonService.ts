import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import csrf from 'csrf-token';
import UserModel from '../../model/userModel';
import VisitorsCountModel from '../../model/visitorsCountModel';

dotenv.config();

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
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

const SECRET_KEY = process.env.SECRET_KEY!;
const updateVisitorCount = async () => {
  const getVisitorCount = await VisitorsCountModel.find().then(
    (visitorsCount: any) => visitorsCount
  );
  const currentVisitorCount = getVisitorCount[0].visitorCount;
  await VisitorsCountModel.updateOne({
    visitorCount: currentVisitorCount + 1,
    lastUpdatedAt: Date.now(),
  });
  return currentVisitorCount;
};

const createCSRFToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const token = csrf.createSync('auth-module project');
      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
};

const authenticateAccount = ({
  email,
  password,
}: LoginCredentials): Promise<AuthResponse> => {
  return new Promise(async (resolve, reject) => {
    await UserModel.findOne({ email })
      .then((user: any) => {
        if (!user) {
          resolve({ success: false });
        } else {
          bcrypt
            .compare(password, user.password)
            .then(async (isPasswordValid: boolean) => {
              if (!isPasswordValid) {
                resolve({ success: false });
              } else {
                const token = jwt.sign(
                  {
                    email: user.email,
                    userId: user.id,
                    organizationId: user.organization,
                  },
                  SECRET_KEY,
                  { expiresIn: '20m' }
                );
                const refreshToken = jwt.sign(
                  {
                    email: user.email,
                    userId: user.id,
                    organizationId: user.organization,
                  },
                  SECRET_KEY,
                  { expiresIn: '2d' }
                );
                user.lastLoggedOn = new Date();
                user.refreshToken = refreshToken;
                await user.save();
                resolve({
                  success: true,
                  userRole: user.userRole,
                  id: user.id,
                  passwordResetRequired: user.passwordResetRequired,
                  applicationWalkThrough: user.applicationWalkThrough,
                  token,
                  refreshToken,
                  firstName: user.firstName,
                  lastName: user.lastName,
                });
              }
            });
        }
      })
      .catch((error: any) => {
        console.error(`Error in authentication: ${error}`);
        reject({ success: false });
      });
  });
};

const refreshToken = async (token: string): Promise<string> => {
  try {
    const user = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;

    const newToken = jwt.sign(
      {
        email: user.email,
        userId: user.userId,
        organizationId: user.organizationId,
      },
      SECRET_KEY,
      { expiresIn: '20m' }
    );

    const userDetails = await UserModel.findOne({ _id: user.userId });

    if (!userDetails || !userDetails.refreshToken) {
      throw new Error('Invalid user token');
    }

    return newToken;
  } catch (error) {
    console.error(`Error in refresh token: ${error}`);
    throw new Error('Invalid user token');
  }
};

const logout = async (userId: string) => {
  await UserModel.findOneAndUpdate(
    { _id: userId },
    { $set: { refreshToken: '' } }
  );
};

export default {
  updateVisitorCount,
  createCSRFToken,
  authenticateAccount,
  refreshToken,
  logout,
};
