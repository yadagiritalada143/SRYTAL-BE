import Joi from 'joi';

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('must be a valid 24-character id');

const optionSchema = Joi.object({
    value: Joi.string()
        .trim()
        .min(1)
        .required()
        .messages({
            'any.required': 'Option value is required.',
            'string.empty': 'Option value is required.',
            'string.min': 'Option value is required.'
        }),
    isanswer: Joi.boolean().default(false)
});

// Per-type option rules (how many options, how many correct answers) are
// enforced in the controller; this schema only guarantees the payload shape.
const createQuizQuestionSchema = Joi.object({
    taskId: objectId.required().messages({
        'any.required': 'Task ID is required.',
        'string.pattern.base': 'Task ID must be a valid ID.'
    }),
    question: Joi.string()
        .trim()
        .min(1)
        .max(5000)
        .required()
        .messages({
            'any.required': 'Question text is required.',
            'string.empty': 'Question text is required.',
            'string.min': 'Question text is required.',
            'string.max': 'Question text must be at most 5000 characters.'
        }),
    type: Joi.string()
        .trim()
        .uppercase()
        .valid('RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA')
        .required()
        .messages({
            'any.required': 'Question type is required.',
            'string.empty': 'Question type is required.',
            'any.only': 'Question type must be RADIO, CHECKBOX, TOGGLE, DROPDOWN, or TEXTAREA.'
        }),
    options: Joi.array().items(optionSchema).optional(),
    status: Joi.string()
        .trim()
        .uppercase()
        .valid('SHOW', 'HIDE')
        .default('SHOW')
        .messages({
            'any.only': 'Question status must be SHOW or HIDE.'
        })
}).required();

export default createQuizQuestionSchema;
