"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const runCourseTaskCodeSchema = joi_1.default.object({
    taskId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Task ID is required.',
        'string.hex': 'Task ID must be a valid ID.',
        'string.length': 'Task ID must be a valid ID.'
    }),
    languageId: joi_1.default.string().trim().optional(),
    language: joi_1.default.string().trim().optional(),
    sourceCode: joi_1.default.string().required().messages({
        'any.required': 'Source code is required.',
        'string.empty': 'Source code is required.'
    })
})
    .or('languageId', 'language').required();
exports.default = runCourseTaskCodeSchema;
