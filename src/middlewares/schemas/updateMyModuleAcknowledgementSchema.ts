import Joi from 'joi';

const updateMyModuleAcknowledgementSchema = Joi.object({
    courseAssignmentId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Course assignment id is required !',
            'string.hex': 'Course assignment id must be a valid ID.',
            'string.length': 'Course assignment id must be a valid ID.'
        }),
    moduleId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Module id is required !',
            'string.hex': 'Module id must be a valid ID.',
            'string.length': 'Module id must be a valid ID.'
        }),
    acknowledged: Joi.boolean()
        .required()
        .messages({
            'any.required': 'acknowledged is required !',
            'boolean.base': 'acknowledged must be a boolean.'
        })
}).required();

export default updateMyModuleAcknowledgementSchema;
