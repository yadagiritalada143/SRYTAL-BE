import Joi from 'joi';

const registrationSchema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[A-Za-z\s]+$/)
        .trim()
        .required()
        .messages({
            'string.base': 'First name should be a string',
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 3 characters',
            'string.max': 'First name must be at most 30 characters',
            'string.pattern.base': 'First name must contain only letters',
            'any.required': 'First name is required',
        }),

    lastName: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[A-Za-z\s]+$/)
        .trim()
        .required()
        .messages({
            'string.base': 'Last name should be a string',
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 3 characters',
            'string.max': 'Last name must be at most 30 characters',
            'string.pattern.base': 'Last name must contain only letters',
            'any.required': 'Last name is required',
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),

    mobileNumber: Joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Mobile number must be exactly 10 digits',
        }),

    userRole: Joi.string()
        .valid('Employee', 'Recruiter', 'ContentWriter')
        .required()
        .messages({
            'string.base': 'User role should be a string',
            'string.empty': 'User role is required',
            'any.only': 'User role must be one of: Employee, Recruiter, ContentWriter',
            'any.required': 'User role is required',
        }),
});

export default registrationSchema;
