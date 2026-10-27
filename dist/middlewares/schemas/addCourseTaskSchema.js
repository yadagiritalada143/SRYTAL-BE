"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const addCourseTaskSchema = joi_1.default.object({
    moduleId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Module ID is required.',
        'string.hex': 'Module ID must be a valid ID.',
        'string.length': 'Module ID must be a valid ID.'
    }),
    orderIdx: joi_1.default.number().integer().min(1).required().messages({
        'any.required': 'orderIdx is required and must be a positive integer.',
        'number.base': 'orderIdx is required and must be a positive integer.',
        'number.integer': 'orderIdx is required and must be a positive integer.',
        'number.min': 'orderIdx is required and must be a positive integer.'
    }),
    taskName: joi_1.default.string().trim().min(1).required().messages({
        'any.required': 'Task name is required.',
        'string.empty': 'Task name is required.',
        'string.min': 'Task name is required.'
    }),
    taskDescription: joi_1.default.string().trim().when('type', {
        is: 'CODE',
        then: joi_1.default.string().trim().min(1).allow('').optional().messages({
            'any.required': 'Task description is required for coding tasks.',
            'string.empty': 'Task description is required for coding tasks.',
            'string.min': 'Task description is required for coding tasks.'
        }),
    }),
    type: joi_1.default.string().trim().uppercase().valid('LINK', 'FILE', 'CODE', 'QUIZ').required().messages({
        'any.required': 'Task type is required.',
        'string.empty': 'Task type is required.',
        'any.only': 'Task type must be LINK, FILE, CODE, or QUIZ.'
    }),
    link: joi_1.default.when('type', {
        is: 'LINK',
        then: joi_1.default.string().trim().uri({ scheme: ['http', 'https'] }).required().messages({
            'any.required': 'A valid HTTP or HTTPS link is required for LINK tasks.',
            'string.empty': 'A valid HTTP or HTTPS link is required for LINK tasks.',
            'string.uri': 'A valid HTTP or HTTPS link is required for LINK tasks.'
        }),
        // A QUIZ task holds only its questions, so it must not carry a link.
        otherwise: joi_1.default.when('type', {
            is: 'QUIZ',
            then: joi_1.default.valid('', null).default('').messages({
                'any.only': 'Links are not allowed for QUIZ tasks.'
            }),
            otherwise: joi_1.default.string().trim().allow('', null).optional()
        })
    }),
    acknowledgementText: joi_1.default.string().trim().allow('').optional().messages({
        'string.base': 'Acknowledgement text must be a string.'
    }),
    taskFileUploaded: joi_1.default.boolean()
        .when('type', {
        is: 'FILE',
        then: joi_1.default.valid(true).optional().messages({
            'any.only': 'A file is required for FILE tasks.',
            'any.required': 'A file is required for FILE tasks.'
        }),
        // A QUIZ task must not carry an uploaded content file.
        otherwise: joi_1.default.when('type', {
            is: 'QUIZ',
            then: joi_1.default.valid(false).optional().messages({
                'any.only': 'Files are not allowed for QUIZ tasks.'
            }),
        })
    })
        .strip(),
    hasThumbnail: joi_1.default.boolean().required().strip(),
    thumbnailMimeType: joi_1.default.string()
        .valid('image/jpeg', 'image/png', 'image/webp')
        .when('hasThumbnail', {
        is: true,
        then: joi_1.default.optional().messages({
            'any.required': 'Thumbnail must be a JPG, PNG, or WEBP image.',
            'any.only': 'Thumbnail must be a JPG, PNG, or WEBP image.'
        }),
    })
        .strip()
});
exports.default = addCourseTaskSchema;
