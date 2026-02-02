import bcrypt from 'bcrypt';
import UserModel from '../../model/userModel';
import hashPasswordUtility from '../../util/hashPassword';

const updatePassword = async (updatePasswordDetails: any) => {
    return new Promise(async (resolve, reject) => {
        await UserModel.findOne({ _id: updatePasswordDetails.userId })
            .then((user: any) => {
                if (!user) {
                    resolve({ success: false, message: 'User not Exists !' });
                } else {
                    bcrypt.compare(updatePasswordDetails.oldPassword, user.password).then((isPasswordValid: boolean) => {
                        if (!isPasswordValid) {
                            resolve({ success: false, message: 'Temporary password is not matched !' });
                        } else {
                            hashPasswordUtility.hashPassword(updatePasswordDetails.newPassword)
                                .then(async (hashedNewPassword: string) => {
                                    const result = await UserModel.updateOne({ _id: updatePasswordDetails.userId }, { password: hashedNewPassword, passwordResetRequired: false });
                                    resolve({ success: true, message: 'Password updated Successfully !' });
                                })
                                .catch((error: any) => {
                                    console.error(`Error occured while update the Password: ${error}`);
                                    reject({ success: false, message: 'Error while updating the password !' });
                                })
                        }
                    });

                }
            })
            .catch((error: any) => {
                console.error(`Error while updating the password ! ${error}`);
                reject({ success: false, message: 'Error while updating the password !' });
            })
    });
}

export default { updatePassword }
