"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const updateMyTaskAcknowledgementSchema = joi_1.default.object({
    courseAssignmentId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Course assignment id is required !',
        'string.hex': 'Course assignment id must be a valid ID.',
        'string.length': 'Course assignment id must be a valid ID.'
    }),
    taskId: joi_1.default.string().hex().length(24).required().messages({
        'any.required': 'Task id is required !',
        'string.hex': 'Task id must be a valid ID.',
        'string.length': 'Task id must be a valid ID.'
    }),
    acknowledged: joi_1.default.boolean().required().messages({
        'any.required': 'acknowledged is required !',
        'boolean.base': 'acknowledged must be a boolean.'
    })
}).required();
exports.default = updateMyTaskAcknowledgementSchema;
