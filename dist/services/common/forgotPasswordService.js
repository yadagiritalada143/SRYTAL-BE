"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const sendForgetPasswordOTPEmail_1 = __importDefault(require("../../util/sendForgetPasswordOTPEmail"));
const hashPassword_1 = __importDefault(require("../../util/hashPassword"));
const userModel_2 = __importDefault(require("../../model/userModel"));
const randomPasswordGenerate = () => {
    return (Math.floor(Math.random() * 90000000) + 10000000) + '';
};
const forgotPassword = async (email) => {
    return new Promise(async (resolve, reject) => {
        await userModel_1.default.findOne({ email })
            .then((user) => {
            if (!user) {
                resolve({ success: false, message: 'User not Exists !' });
            }
            else {
                const randomPassword = randomPasswordGenerate();
                hashPassword_1.default.hashPassword(randomPassword).then(async (hashedPassword) => {
                    sendForgetPasswordOTPEmail_1.default.sendOTPEmail(user.firstName, user.lastName, user.email, randomPassword);
                    const result = await userModel_2.default.findOneAndUpdate({ email }, { password: hashedPassword, passwordResetRequired: 'true' });
                    if (!result) {
                        reject({ success: false, message: 'Error in sending OTP to user !' });
                    }
                    resolve({ success: true, message: 'Email Sent successfully to you. Please check your Inbox and come back to Login page and then login with your temporary password !' });
                });
            }
        })
            .catch((error) => {
            console.log(`Error in forget password flow:  ${error}`);
            reject({ success: false, message: 'Error in forget password flow !' });
        });
    });
};
exports.default = { forgotPassword };
