import Joi from 'joi';

const addCourseSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'any.required': 'Invalid course details'
    }),
    courseName: Joi.string().trim().min(1).max(150).required().messages({
            'any.required': 'Course name is required.',
            'string.empty': 'Course name is required.',
            'string.min': 'Course name is required.',
            'string.max': 'Course name must be at most 150 characters.'
        }),
    courseDescription: Joi.string()
        .trim()
        .allow('')
        .optional()
}).required();

export default addCourseSchema;
