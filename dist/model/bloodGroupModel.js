"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BloodgroupSchema = new mongoose_1.default.Schema({
    type: { type: mongoose_1.default.Schema.Types.String, required: true },
}, {
    collection: 'blood-group',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const BloodgroupModel = mongoose_1.default.model('BloodgroupSchema', BloodgroupSchema);
exports.default = BloodgroupModel;
