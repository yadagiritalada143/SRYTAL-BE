import Joi from 'joi';

const updateCourseSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Course ID is required.',
            'string.hex': 'Course ID must be a valid ID.',
            'string.length': 'Course ID must be a valid ID.'
        }),
    courseName: Joi.string()
        .trim()
        .min(1)
        .max(150)
        .required()
        .messages({
            'any.required': 'Course name is required.',
            'string.empty': 'Course name is required.',
            'string.min': 'Course name is required.',
            'string.max': 'Course name must be at most 150 characters.'
        }),
    courseDescription: Joi.string()
        .trim()
        .allow('')
        .optional(),
    status: Joi.string()
        .trim()
        .uppercase()
        .valid('ACTIVE', 'ARCHIVE')
        .required()
        .messages({
            'any.required': 'Please provide valid status !',
            'any.only': 'Please provide valid status !',
            'string.empty': 'Please provide valid status !'
        })
}).required();

export default updateCourseSchema;
