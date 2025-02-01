"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registerEmployeeByAdminService_1 = __importDefault(require("../../services/admin/registerEmployeeByAdminService"));
const registrationMessages_1 = require("../../constants/registrationMessages");
const sendRegistrationOTPEmail_1 = __importDefault(require("../../util/sendRegistrationOTPEmail"));
const hashPassword_1 = __importDefault(require("../../util/hashPassword"));
const randomPasswordGenerate = () => {
    return (Math.floor(Math.random() * 90000000) + 10000000) + '';
};
const register = (req, res) => {
    const newRegistrationData = req.body;
    const randomPassword = randomPasswordGenerate();
    newRegistrationData.password = randomPassword;
    newRegistrationData.passwordResetRequired = true;
    newRegistrationData.organization = newRegistrationData.organizationId;
    newRegistrationData.applicationWalkThrough = 1;
    newRegistrationData.isDeleted = false;
    registerEmployeeByAdminService_1.default
        .isAccountPresent(newRegistrationData.email)
        .then((emailExists) => {
        if (emailExists) {
            throw new Error(registrationMessages_1.ERRORS.EMAIL_EXISTS);
        }
        return hashPassword_1.default.hashPassword(newRegistrationData.password);
    })
        .then(hashedPassword => {
        newRegistrationData.password = hashedPassword;
        return registerEmployeeByAdminService_1.default.saveAccount(newRegistrationData);
    })
        .then(responseAfterRegistration => {
        if (responseAfterRegistration.id) {
            sendRegistrationOTPEmail_1.default.sendOTPEmail(newRegistrationData.firstName, newRegistrationData.lastName, newRegistrationData.email, randomPassword);
        }
        return res.status(201).json({ message: registrationMessages_1.ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
    })
        .catch(error => {
        if (error.message === registrationMessages_1.ERRORS.EMAIL_EXISTS) {
            return res.status(409).json({ message: error.message });
        }
        console.log(error);
        return res.status(500).json({ message: registrationMessages_1.ERRORS.USER_CREATION_ERROR });
    });
};
exports.default = { register };
