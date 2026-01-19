import UserModel from '../../model/userModel';
import utilService from '../../util/sendResetPasswordMail';
import hashPasswordUtility from '../../util/hashPassword';

const randomPasswordGenerate = () => {
    return (Math.floor(Math.random() * 90000000) + 10000000) + '';
}

const employeePasswordResetByAdmin = async (employeeId: string) => {
    try {
        const user = await UserModel.findOne({ _id: employeeId });
        if (!user) {
            return { success: false, message: 'User not exists!' };
        }

        const randomPassword = randomPasswordGenerate();
        const hashedPassword = await hashPasswordUtility.hashPassword(randomPassword);
        await utilService.sendResetPasswordMail(user.firstName, user.lastName, user.email, randomPassword);
        const result = await UserModel.findOneAndUpdate(
            { _id: employeeId }, 
            { password: hashedPassword, passwordResetRequired: 'true' },
            { new: true }
        );

        if (!result) {
            return { success: false, message: 'Error in updating password!' };
        }

        return { success: true, message: 'Email sent successfully. Please login with temporary password.' };

    } catch (error) {
        console.error('Error occurred while resetting password:', error);
        throw error;
    }
}

export default { employeePasswordResetByAdmin };
