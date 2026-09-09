"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EmployeeroleSchema = new mongoose_1.default.Schema({
    designation: { type: mongoose_1.default.Schema.Types.String, required: true },
}, {
    collection: 'employee-role',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const Employeerole = mongoose_1.default.model('EmployeeroleSchema', EmployeeroleSchema);
exports.default = Employeerole;
