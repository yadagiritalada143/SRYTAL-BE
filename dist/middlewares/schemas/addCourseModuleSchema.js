"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseModuleSchema = exports.addCourseModuleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const addCourseModuleSchema = joi_1.default.object({
    courseId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Course id is required !',
        'string.hex': 'Course id must be a valid ID.',
        'string.length': 'Course id must be a valid ID.'
    }),
    moduleName: joi_1.default.string().trim().min(1).max(150).required().messages({
        'any.required': 'Module Name is required !',
        'string.empty': 'Module Name is required !',
        'string.min': 'Module Name is required !',
        'string.max': 'Module Name must be at most 150 characters.'
    }),
    moduleDescription: joi_1.default.string().trim().allow('').optional(),
    orderIdx: joi_1.default.number()
        .integer()
        .min(0)
        .required()
        .messages({
        'any.required': 'orderIdx is required and must be a positive integer.',
        'number.base': 'orderIdx is required and must be a positive integer.',
        'number.integer': 'orderIdx is required and must be a positive integer.',
        'number.min': 'orderIdx is required and must be a positive integer.',
    }),
}).required();
exports.addCourseModuleSchema = addCourseModuleSchema;
const updateCourseModuleSchema = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Module ID is required.',
        'string.hex': 'Module ID must be a valid ID.',
        'string.length': 'Module ID must be a valid ID.'
    }),
    moduleName: joi_1.default.string().trim().min(1).max(150).required().messages({
        'any.required': 'Module Name is required !',
        'string.empty': 'Module Name is required !',
        'string.min': 'Module Name is required !',
        'string.max': 'Module Name must be at most 150 characters.'
    }),
    moduleDescription: joi_1.default.string().trim().allow('').optional(),
    status: joi_1.default.string().trim().uppercase().valid('ACTIVE', 'ARCHIVE').required().messages({
        'any.required': 'Please provide valid status !',
        'any.only': 'Please provide valid status !',
        'string.empty': 'Please provide valid status !'
    }),
    orderIdx: joi_1.default.number().integer().min(1).required().messages({
        'any.required': 'orderIdx is required and must be a non-negative integer.',
        'number.base': 'orderIdx must be a number.',
        'number.integer': 'orderIdx must be an integer.',
        'number.min': 'orderIdx must be greater than or equal to 0.'
    }),
}).required();
exports.updateCourseModuleSchema = updateCourseModuleSchema;
