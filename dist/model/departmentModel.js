"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const DepartmentSchema = new mongoose_1.default.Schema({
    departmentName: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
}, {
    collection: 'department',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
DepartmentSchema.plugin(mongoose_unique_validator_1.default);
const Department = mongoose_1.default.model('Department', DepartmentSchema);
exports.default = Department;
