"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const csrf_token_1 = __importDefault(require("csrf-token"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const visitorsCountModel_1 = __importDefault(require("../../model/visitorsCountModel"));
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
const updateVisitorCount = async () => {
    const getVisitorCount = await visitorsCountModel_1.default.find().then((visitorsCount) => visitorsCount);
    const currentVisitorCount = getVisitorCount[0].visitorCount;
    await visitorsCountModel_1.default.updateOne({
        visitorCount: currentVisitorCount + 1,
        lastUpdatedAt: Date.now(),
    });
    return currentVisitorCount;
};
const createCSRFToken = () => {
    return new Promise((resolve, reject) => {
        try {
            const token = csrf_token_1.default.createSync('auth-module project');
            resolve(token);
        }
        catch (error) {
            reject(error);
        }
    });
};
const authenticateAccount = ({ email, password, }) => {
    return new Promise(async (resolve, reject) => {
        await userModel_1.default.findOne({ email })
            .then((user) => {
            if (!user) {
                resolve({ success: false });
            }
            else {
                bcrypt_1.default
                    .compare(password, user.password)
                    .then(async (isPasswordValid) => {
                    if (!isPasswordValid) {
                        resolve({ success: false });
                    }
                    else {
                        const token = jsonwebtoken_1.default.sign({
                            email: user.email,
                            userId: user.id,
                            organizationId: user.organization,
                        }, SECRET_KEY, { expiresIn: '20m' });
                        const refreshToken = jsonwebtoken_1.default.sign({
                            email: user.email,
                            userId: user.id,
                            organizationId: user.organization,
                        }, SECRET_KEY, { expiresIn: '2d' });
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
            .catch((error) => {
            console.error(`Error in authentication: ${error}`);
            reject({ success: false });
        });
    });
};
const refreshToken = async (token) => {
    try {
        const user = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const newToken = jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user.userId,
            organizationId: user.organizationId,
        }, SECRET_KEY, { expiresIn: '20m' });
        const userDetails = await userModel_1.default.findOne({ _id: user.userId });
        if (!userDetails || !userDetails.refreshToken) {
            throw new Error('Invalid user token');
        }
        return newToken;
    }
    catch (error) {
        console.error(`Error in refresh token: ${error}`);
        throw new Error('Invalid user token');
    }
};
const logout = async (userId) => {
    await userModel_1.default.findOneAndUpdate({ _id: userId }, { $set: { refreshToken: '' } });
};
exports.default = {
    updateVisitorCount,
    createCSRFToken,
    authenticateAccount,
    refreshToken,
    logout,
};
