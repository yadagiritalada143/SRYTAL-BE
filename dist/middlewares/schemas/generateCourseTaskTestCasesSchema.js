"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const generateCourseTaskTestCasesSchema = joi_1.default.object({
    taskId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Task ID is required.',
        'string.hex': 'Task ID must be a valid ID.',
        'string.length': 'Task ID must be a valid ID.'
    }),
    forceRegenerate: joi_1.default.boolean().default(false)
}).required();
exports.default = generateCourseTaskTestCasesSchema;
