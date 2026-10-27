"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const updateCourseTaskSchema = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Task ID is required.',
        'string.hex': 'Task ID must be a valid ID.',
        'string.length': 'Task ID must be a valid ID.'
    }),
    taskName: joi_1.default.string().trim().min(1).max(150).required().messages({
        'any.required': 'Please provide the task name !',
        'string.empty': 'Please provide the task name !',
        'string.min': 'Please provide the task name !',
        'string.max': 'Task name must be at most 150 characters.'
    }),
    taskDescription: joi_1.default.string().trim().allow('').optional(),
    orderIdx: joi_1.default.number().integer().min(1).optional().messages({
        'number.base': 'orderIdx must be a positive integer.',
        'number.integer': 'orderIdx must be a positive integer.',
        'number.min': 'orderIdx must be a positive integer.'
    }),
    acknowledgementText: joi_1.default.string().trim().allow('').optional().messages({
        'string.base': 'Acknowledgement text must be a string.'
    }),
    status: joi_1.default.string().trim().uppercase().valid('ACTIVE', 'ARCHIVE').required().messages({
        'any.required': 'Please provide valid status !',
        'any.only': 'Please provide valid status !',
        'string.empty': 'Please provide valid status !'
    }),
    executionMode: joi_1.default.string().trim().uppercase().valid('CALLABLE', 'STDIN').optional().messages({
        'any.only': 'Execution mode must be CALLABLE or STDIN.',
        'string.empty': 'Execution mode must be CALLABLE or STDIN.'
    })
}).required();
exports.default = updateCourseTaskSchema;
