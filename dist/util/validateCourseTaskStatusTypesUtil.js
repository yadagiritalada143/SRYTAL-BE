"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validCourseTaskStatusTypes_1 = __importDefault(require("../types/validCourseTaskStatusTypes"));
const isValidCourseTaskStatus = (status) => {
    return validCourseTaskStatusTypes_1.default.includes(String(status || '').toUpperCase());
};
exports.default = isValidCourseTaskStatus;
