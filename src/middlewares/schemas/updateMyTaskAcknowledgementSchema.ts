import Joi from 'joi';

const updateMyTaskAcknowledgementSchema = Joi.object({
    courseAssignmentId: Joi.string().hex().length(24).required().messages({
            'any.required': 'Course assignment id is required !',
            'string.hex': 'Course assignment id must be a valid ID.',
            'string.length': 'Course assignment id must be a valid ID.'
        }),
    taskId: Joi.string().hex().length(24).required().messages({
            'any.required': 'Task id is required !',
            'string.hex': 'Task id must be a valid ID.',
            'string.length': 'Task id must be a valid ID.'
        }),
    acknowledged: Joi.boolean().required().messages({
            'any.required': 'acknowledged is required !',
            'boolean.base': 'acknowledged must be a boolean.'
        })
}).required();

export default updateMyTaskAcknowledgementSchema;