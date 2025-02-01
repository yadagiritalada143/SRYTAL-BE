import { Request, Response } from 'express';
import adminSignUpService from '../../services/admin/registerEmployeeByAdminService';
import { ERRORS, ACCOUNT_MESSAGES } from '../../constants/registrationMessages';
import utilService from '../../util/sendRegistrationOTPEmail';
import hashPasswordUtility from '../../util/hashPassword';

const randomPasswordGenerate = () => {
    return (Math.floor(Math.random() * 90000000) + 10000000) + '';
}

const register = (req: Request, res: Response) => {
    const newRegistrationData = req.body;
    const randomPassword = randomPasswordGenerate();
    newRegistrationData.password = randomPassword;
    newRegistrationData.passwordResetRequired = true;
    newRegistrationData.organization = newRegistrationData.organizationId;
    newRegistrationData.applicationWalkThrough = 1;
    newRegistrationData.isDeleted = false;
    adminSignUpService
        .isAccountPresent(newRegistrationData.email)
        .then((emailExists) => {
            if (emailExists) {
                throw new Error(ERRORS.EMAIL_EXISTS);
            }
            return hashPasswordUtility.hashPassword(newRegistrationData.password);
        })
        .then(hashedPassword => {
            newRegistrationData.password = hashedPassword;
            return adminSignUpService.saveAccount(newRegistrationData);
        })
        .then(responseAfterRegistration => {
            if (responseAfterRegistration.id) {
                utilService.sendOTPEmail(newRegistrationData.firstName, newRegistrationData.lastName, newRegistrationData.email, randomPassword);
            }
            return res.status(201).json({ message: ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
        })
        .catch(error => {
            if (error.message === ERRORS.EMAIL_EXISTS) {
                return res.status(409).json({ message: error.message });
            }
            console.log(error);
            return res.status(500).json({ message: ERRORS.USER_CREATION_ERROR });
        });
};

export default { register };
