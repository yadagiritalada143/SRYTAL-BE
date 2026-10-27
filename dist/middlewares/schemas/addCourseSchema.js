"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseSchema = exports.addCourseSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const addCourseSchema = joi_1.default.object({
    courseName: joi_1.default.string().trim().min(1).max(150).required().messages({
        'any.required': 'Course name is required.',
        'string.empty': 'Course name is required.',
        'string.min': 'Course name is required.',
        'string.max': 'Course name must be at most 150 characters.'
    }),
    courseDescription: joi_1.default.string().trim().allow('').optional()
}).required();
exports.addCourseSchema = addCourseSchema;
const updateCourseSchema = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Course ID is required.',
        'string.hex': 'Course ID must be a valid ID.',
        'string.length': 'Course ID must be a valid ID.'
    }),
    courseName: joi_1.default.string().trim().min(1).max(150).required().messages({
        'any.required': 'Course name is required.',
        'string.empty': 'Course name is required.',
        'string.min': 'Course name is required.',
        'string.max': 'Course name must be at most 150 characters.'
    }),
    courseDescription: joi_1.default.string().trim().allow('').optional(),
    status: joi_1.default.string().trim().uppercase().valid('ACTIVE', 'ARCHIVE').required().messages({
        'any.required': 'Please provide valid status !',
        'any.only': 'Please provide valid status !',
        'string.empty': 'Please provide valid status !'
    })
}).required();
exports.updateCourseSchema = updateCourseSchema;
