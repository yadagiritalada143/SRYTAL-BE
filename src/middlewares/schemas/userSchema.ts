import Joi from 'joi';

const userSchema = Joi.object({
    employeeId: Joi.string().min(3).max(30).optional().allow(''),
    firstName: Joi.string().min(3).max(30).optional().allow(''),
    lastName: Joi.string().min(3).max(30).optional().allow(''),
    email: Joi.string().email().required(),
    mobileNumber: Joi.number().integer().min(0).optional().allow(''),
    bloodGroup: Joi.string().optional().allow(''),
    bankDetailsInfo: {
        accountHolderName: Joi.string().optional().allow(''),
        accountNumber: Joi.string().optional().allow(''),
        ifscCode: Joi.string().optional().allow(''),
    },
    employmentType: Joi.string().optional().allow(''),
    employeeRole: Joi.array().optional().allow(''),
    organization: Joi.string().optional().allow(''),
    dateOfBirth: Joi.date().optional().allow(''),
    presentAddress: Joi.string().optional().allow(''),
    permanentAddress: Joi.string().optional().allow('')

});

export default userSchema;
