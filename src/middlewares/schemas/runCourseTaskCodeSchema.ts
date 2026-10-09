import Joi from 'joi';

const runCourseTaskCodeSchema = Joi.object({
    taskId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Task ID is required.',
            'string.hex': 'Task ID must be a valid ID.',
            'string.length': 'Task ID must be a valid ID.'
        }),
    languageId: Joi.string().trim().optional(),
    language: Joi.string().trim().optional(),
    sourceCode: Joi.string()
        .required()
        .messages({
            'any.required': 'Source code is required.',
            'string.empty': 'Source code is required.'
        })
})
    .or('languageId', 'language')
    .required();

export default runCourseTaskCodeSchema;
