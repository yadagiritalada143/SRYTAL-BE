import Joi from 'joi';

const generateCourseTaskTestCasesSchema = Joi.object({
    taskId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Task ID is required.',
            'string.hex': 'Task ID must be a valid ID.',
            'string.length': 'Task ID must be a valid ID.'
        }),
    forceRegenerate: Joi.boolean().default(false)
}).required();

export default generateCourseTaskTestCasesSchema;
