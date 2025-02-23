import Joi from 'joi';

const userSchema = Joi.object({
    employeeId:Joi.string().min(3).max(30).optional(),
    firstName: Joi.string().min(3).max(30).optional(),
    lastName: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.number().integer().min(0).optional(),
    bloodGroup: Joi.string().optional(),
    bankDetailsInfo: {
        accountHolderName: Joi.string().optional(),
        accountNumber: Joi.string().optional(),
        ifscCode: Joi.string().optional(),
    },
    employmentType: Joi.string().optional(),
    employeeRole: Joi.array().optional(),
    organization: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),

});

export default userSchema;