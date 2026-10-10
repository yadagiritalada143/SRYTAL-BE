import Joi from 'joi';

const submitCourseTaskCodeSchema = Joi.object({
    codingTaskId: Joi.string().hex().length(24).optional().messages({
        'string.hex': 'Task ID must be a valid ID.',
        'string.length': 'Task ID must be a valid ID.'
    }),
    taskId: Joi.string().hex().length(24).optional().messages({
        'string.hex': 'Task ID must be a valid ID.',
        'string.length': 'Task ID must be a valid ID.'
    }),
    languageId: Joi.string().trim().optional(),
    language: Joi.string().trim().optional(),
    sourceCode: Joi.string().required().messages({
        'any.required': 'Source code is required.',
        'string.empty': 'Source code is required.'
    })
})
    .or('codingTaskId', 'taskId')
    .or('languageId', 'language')
    .required();

export default submitCourseTaskCodeSchema;
