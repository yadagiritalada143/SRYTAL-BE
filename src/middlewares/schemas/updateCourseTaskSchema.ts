import Joi from 'joi';

const updateCourseTaskSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Task ID is required.',
            'string.hex': 'Task ID must be a valid ID.',
            'string.length': 'Task ID must be a valid ID.'
        }),
    taskName: Joi.string()
        .trim()
        .min(1)
        .max(150)
        .required()
        .messages({
            'any.required': 'Please provide the task name !',
            'string.empty': 'Please provide the task name !',
            'string.min': 'Please provide the task name !',
            'string.max': 'Task name must be at most 150 characters.'
        }),
    taskDescription: Joi.string()
        .trim()
        .allow('')
        .optional(),
    status: Joi.string()
        .trim()
        .uppercase()
        .valid('ACTIVE', 'INACTIVE')
        .required()
        .messages({
            'any.required': 'Please provide valid status !',
            'any.only': 'Please provide valid status !',
            'string.empty': 'Please provide valid status !'
        }),
    executionMode: Joi.string()
        .trim()
        .uppercase()
        .valid('CALLABLE', 'STDIN')
        .optional()
        .messages({
            'any.only': 'Execution mode must be CALLABLE or STDIN.',
            'string.empty': 'Execution mode must be CALLABLE or STDIN.'
        })
}).required();

export default updateCourseTaskSchema;
