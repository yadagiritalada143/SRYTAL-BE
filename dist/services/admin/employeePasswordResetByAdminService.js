"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const sendResetPasswordMail_1 = __importDefault(require("../../util/sendResetPasswordMail"));
const hashPassword_1 = __importDefault(require("../../util/hashPassword"));
const randomPasswordGenerate = () => {
    return (Math.floor(Math.random() * 90000000) + 10000000) + '';
};
const employeePasswordResetByAdmin = async (employeeId) => {
    try {
        const user = await userModel_1.default.findOne({ _id: employeeId });
        if (!user) {
            return { success: false, message: 'User not exists!' };
        }
        const randomPassword = randomPasswordGenerate();
        const hashedPassword = await hashPassword_1.default.hashPassword(randomPassword);
        await sendResetPasswordMail_1.default.sendResetPasswordMail(user.firstName, user.lastName, user.email, randomPassword);
        const result = await userModel_1.default.findOneAndUpdate({ _id: employeeId }, { password: hashedPassword, passwordResetRequired: 'true' }, { new: true });
        if (!result) {
            return { success: false, message: 'Error in updating password!' };
        }
        return { success: true, message: 'Email sent successfully. Please login with temporary password.' };
    }
    catch (error) {
        console.error(`Error occurred while resetting password: ${error}`);
        throw error;
    }
};
exports.default = { employeePasswordResetByAdmin };
