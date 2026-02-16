"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const userSchema = joi_1.default.object({
    employeeId: joi_1.default.string().min(3).max(30).optional().allow(''),
    firstName: joi_1.default.string().min(3).max(30).optional().allow(''),
    lastName: joi_1.default.string().min(3).max(30).optional().allow(''),
    email: joi_1.default.string().email().required(),
    mobileNumber: joi_1.default.number().integer().min(0).optional().allow(''),
    bloodGroup: joi_1.default.string().optional().allow(''),
    bankDetailsInfo: {
        accountHolderName: joi_1.default.string().optional().allow(''),
        accountNumber: joi_1.default.string().optional().allow(''),
        ifscCode: joi_1.default.string().optional().allow(''),
    },
    employmentType: joi_1.default.string().optional().allow(''),
    employeeRole: joi_1.default.array().optional().allow(''),
    organization: joi_1.default.string().optional().allow(''),
    dateOfBirth: joi_1.default.date().optional().allow(''),
    panCardNumber: joi_1.default.string().optional().allow(''),
    aadharNumber: joi_1.default.string().optional().allow(''),
    presentAddress: joi_1.default.string().optional().allow(''),
    permanentAddress: joi_1.default.string().optional().allow('')
});
exports.default = userSchema;
