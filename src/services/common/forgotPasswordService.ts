import UserModel from '../../model/userModel';
import utilService from '../../util/sendForgetPasswordOTPEmail';
import hashPasswordUtility from '../../util/hashPassword';
import Usermodel from '../../model/userModel';

const randomPasswordGenerate = () => {
    return (Math.floor(Math.random() * 90000000) + 10000000) + '';
}

const forgotPassword = async (email: string) => {
    return new Promise(async (resolve, reject) => {
        await UserModel.findOne({ email })
            .then((user: any) => {
                if (!user) {
                    resolve({ success: false, message: 'User not Exists !' });
                } else {
                    const randomPassword = randomPasswordGenerate();
                    hashPasswordUtility.hashPassword(randomPassword).then((hashedPassword) => {
                        utilService.sendOTPEmail(user.firstName, user.lastName, user.email, hashedPassword);
                    
                        Usermodel.updateOne({email}, {password: hashedPassword, passwordResetRequired: 'true'});    
                    })
                    resolve({ success: true, message: 'Email Sent successfully to you. Please chck yor inbox and come back to login page and then login with your temporary password !'});
                }
            })
            .catch((error: any) => {
                console.log(`Error in forget password flow:  ${error}`);
                reject({ success: false, message: 'Error in forget password flow !' });
            })
    });
}

export default { forgotPassword }
