"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const cloneCourseSchema = joi_1.default.object({
    courseId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Source course id is required.',
        'string.hex': 'Source course id must be a valid ID.',
        'string.length': 'Source course id must be a valid ID.'
    }),
    courseName: joi_1.default.string().trim().min(1).max(150).required().messages({
        'any.required': 'Course name is required.',
        'string.empty': 'Course name is required.',
        'string.min': 'Course name is required.',
        'string.max': 'Course name must be at most 150 characters.'
    }),
    modules: joi_1.default.array()
        .items(joi_1.default.object({
        moduleId: joi_1.default.string().hex().length(24).required().messages({
            'any.required': 'Module id is required.',
            'string.hex': 'Module id must be a valid ID.',
            'string.length': 'Module id must be a valid ID.'
        }),
        taskIds: joi_1.default.array().items(joi_1.default.string().hex().length(24).messages({
            'string.hex': 'Task id must be a valid ID.',
            'string.length': 'Task id must be a valid ID.'
        })).unique().default([])
    }))
        .min(1)
        .required()
        .messages({
        'any.required': 'At least one module must be selected.',
        'array.min': 'At least one module must be selected.'
    })
}).required();
exports.default = cloneCourseSchema;
