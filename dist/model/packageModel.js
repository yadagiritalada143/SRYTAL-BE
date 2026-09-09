"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userModel_1 = __importDefault(require("../model/userModel"));
const PackagesSchema = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    title: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    description: { type: mongoose_1.default.Schema.Types.String },
    startDate: { type: mongoose_1.default.Schema.Types.Date },
    endDate: { type: mongoose_1.default.Schema.Types.Date },
    approvers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default }],
    isDeleted: { type: mongoose_1.default.Schema.Types.Boolean },
}, {
    collection: 'packages',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
PackagesSchema.plugin(mongoose_unique_validator_1.default);
const PackagesModel = mongoose_1.default.model('PackagesModel', PackagesSchema);
exports.default = PackagesModel;
