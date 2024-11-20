"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EmploymenttypeSchema = new mongoose_1.default.Schema({
    employmentType: { type: mongoose_1.default.Schema.Types.String, required: true },
}, {
    collection: 'employment-type',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const Employmenttype = mongoose_1.default.model('EmploymenttypeSchema', EmploymenttypeSchema);
exports.default = Employmenttype;
