import Joi from 'joi';

const addCourseTaskSchema = Joi.object({
    moduleId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Module ID is required.',
            'string.hex': 'Module ID must be a valid ID.',
            'string.length': 'Module ID must be a valid ID.'
        }),
    taskName: Joi.string()
        .trim()
        .min(1)
        .required()
        .messages({
            'any.required': 'Task name is required.',
            'string.empty': 'Task name is required.',
            'string.min': 'Task name is required.'
        }),
    taskDescription: Joi.string()
        .trim()
        .when('type', {
            is: 'CODE',
            then: Joi.string().trim().min(1).required().messages({
                'any.required': 'Task description is required for coding tasks.',
                'string.empty': 'Task description is required for coding tasks.',
                'string.min': 'Task description is required for coding tasks.'
            }),
            otherwise: Joi.string().trim().allow('').optional()
        }),
    type: Joi.string()
        .trim()
        .uppercase()
        .valid('LINK', 'FILE', 'CODE')
        .required()
        .messages({
            'any.required': 'Task type is required.',
            'string.empty': 'Task type is required.',
            'any.only': 'Task type must be LINK, FILE, or CODE.'
        }),
    link: Joi.string()
        .trim()
        .uri({ scheme: ['http', 'https'] })
        .when('type', {
            is: 'LINK',
            then: Joi.required().messages({
                'any.required': 'A valid HTTP or HTTPS link is required for LINK tasks.',
                'string.empty': 'A valid HTTP or HTTPS link is required for LINK tasks.',
                'string.uri': 'A valid HTTP or HTTPS link is required for LINK tasks.'
            }),
            otherwise: Joi.optional()
        }),
    taskFileUploaded: Joi.boolean()
        .when('type', {
            is: 'FILE',
            then: Joi.valid(true).optional().messages({
                'any.only': 'A file is required for FILE tasks.',
                'any.required': 'A file is required for FILE tasks.'
            }),
            otherwise: Joi.optional()
        })
        .strip(),
    hasThumbnail: Joi.boolean().required().strip(),
    thumbnailMimeType: Joi.string()
        .valid('image/jpeg', 'image/png', 'image/webp')
        .when('hasThumbnail', {
            is: true,
            then: Joi.optional().messages({
                'any.required': 'Thumbnail must be a JPG, PNG, or WEBP image.',
                'any.only': 'Thumbnail must be a JPG, PNG, or WEBP image.'
            }),
    
        })
        .strip()
});

export default addCourseTaskSchema;
