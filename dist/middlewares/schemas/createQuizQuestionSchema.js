"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuizQuestionSchema = exports.createQuizQuestionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const objectId = joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/).message('must be a valid 24-character id');
const optionSchema = joi_1.default.object({
    value: joi_1.default.string().trim().min(1).required().messages({
        'any.required': 'Option value is required.',
        'string.empty': 'Option value is required.',
        'string.min': 'Option value is required.'
    }),
    isanswer: joi_1.default.boolean().default(false)
});
const createQuizQuestionSchema = joi_1.default.object({
    taskId: objectId.required().messages({
        'any.required': 'Task ID is required.',
        'string.pattern.base': 'Task ID must be a valid ID.'
    }),
    question: joi_1.default.string().trim().min(1).max(5000).required().messages({
        'any.required': 'Question text is required.',
        'string.empty': 'Question text is required.',
        'string.min': 'Question text is required.',
        'string.max': 'Question text must be at most 5000 characters.'
    }),
    type: joi_1.default.string().trim()
        .uppercase().valid('RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA').required().messages({
        'any.required': 'Question type is required.',
        'string.empty': 'Question type is required.',
        'any.only': 'Question type must be RADIO, CHECKBOX, TOGGLE, DROPDOWN, or TEXTAREA.'
    }),
    options: joi_1.default.array().items(optionSchema).optional(),
    status: joi_1.default.string().trim().uppercase().valid('SHOW', 'HIDE').default('SHOW').messages({
        'any.only': 'Question status must be SHOW or HIDE.'
    })
}).required();
exports.createQuizQuestionSchema = createQuizQuestionSchema;
const updateQuizQuestionSchema = joi_1.default.object({
    question: joi_1.default.string().trim().min(1).max(5000),
    type: joi_1.default.string().trim().uppercase().valid('RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA'),
    options: joi_1.default.array().items(optionSchema),
    status: joi_1.default.string().trim().uppercase().valid('SHOW', 'HIDE')
}).min(1);
exports.updateQuizQuestionSchema = updateQuizQuestionSchema;
