"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validCourseStatusTypes_1 = __importDefault(require("../types/validCourseStatusTypes"));
const isValidStatus = (status) => {
    return validCourseStatusTypes_1.default.includes(status.toUpperCase());
};
exports.default = isValidStatus;
