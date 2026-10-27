"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const reorderCourseModulesSchema = joi_1.default.object({
    courseId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Course id is required !',
        'string.base': 'Course id must be a valid ID.',
        'string.hex': 'Course id must be a valid ID.',
        'string.length': 'Course id must be a valid ID.'
    }),
    modules: joi_1.default.array()
        .items(joi_1.default.object({
        moduleId: joi_1.default.string().hex().length(24).required().messages({
            'any.required': 'Module ID is required.',
            'string.base': 'Module ID must be a valid ID.',
            'string.hex': 'Module ID must be a valid ID.',
            'string.length': 'Module ID must be a valid ID.'
        }),
        orderIdx: joi_1.default.number().integer().min(1).required().messages({
            'any.required': 'orderIdx is required !',
            'number.base': 'orderIdx must be a number !',
            'number.integer': 'orderIdx must be an integer !',
            'number.min': 'orderIdx must be greater than or equal to 1 !'
        })
    }).required())
        .min(1)
        .required()
        .custom((modules, helpers) => {
        const moduleIds = modules.map((module) => module.moduleId);
        if (new Set(moduleIds).size !== moduleIds.length) {
            return helpers.error('any.invalid');
        }
        const orderIdxs = modules.map((module) => module.orderIdx);
        if (new Set(orderIdxs).size !== orderIdxs.length) {
            return helpers.error('any.invalid');
        }
        return modules;
    })
        .messages({
        'any.required': 'Modules array is required !',
        'array.base': 'Modules must be an array !',
        'array.min': 'Modules array must contain at least one module !',
        'array.includesRequiredUnknowns': 'Each module must contain a valid moduleId and orderIdx !',
        'any.invalid': 'Duplicate module IDs or orderIdx values are not allowed !'
    })
}).required();
exports.default = reorderCourseModulesSchema;
