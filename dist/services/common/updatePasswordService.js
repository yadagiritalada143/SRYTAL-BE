"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const hashPassword_1 = __importDefault(require("../../util/hashPassword"));
const updatePassword = async (updatePasswordDetails) => {
    return new Promise(async (resolve, reject) => {
        await userModel_1.default.findOne({ _id: updatePasswordDetails.userId })
            .then((user) => {
            if (!user) {
                resolve({ success: false, message: 'User not Exists !' });
            }
            else {
                bcrypt_1.default.compare(updatePasswordDetails.oldPassword, user.password).then((isPasswordValid) => {
                    if (!isPasswordValid) {
                        resolve({ success: false, message: 'Temporary password is not matched !' });
                    }
                    else {
                        hashPassword_1.default.hashPassword(updatePasswordDetails.newPassword)
                            .then(async (hashedNewPassword) => {
                            const result = await userModel_1.default.updateOne({ _id: updatePasswordDetails.userId }, { password: hashedNewPassword, passwordResetRequired: false });
                            resolve({ success: true, message: 'Password updated Successfully !' });
                        })
                            .catch((error) => {
                            console.error(`Error occured while update the Password: ${error}`);
                            reject({ success: false, message: 'Error while updating the password !' });
                        });
                    }
                });
            }
        })
            .catch((error) => {
            console.error(`Error while updating the password ! ${error}`);
            reject({ success: false, message: 'Error while updating the password !' });
        });
    });
};
exports.default = { updatePassword };
