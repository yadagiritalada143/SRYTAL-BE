"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userModel_1 = __importDefault(require("../model/userModel"));
const PoolCompaniesSchema = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    companyName: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    primaryContact: {
        name: { type: mongoose_1.default.Schema.Types.String },
        email: { type: mongoose_1.default.Schema.Types.String },
        phone: { type: mongoose_1.default.Schema.Types.String }
    },
    secondaryContact_1: {
        name: { type: mongoose_1.default.Schema.Types.String },
        email: { type: mongoose_1.default.Schema.Types.String },
        phone: { type: mongoose_1.default.Schema.Types.String }
    },
    secondaryContact_2: {
        name: { type: mongoose_1.default.Schema.Types.String },
        email: { type: mongoose_1.default.Schema.Types.String },
        phone: { type: mongoose_1.default.Schema.Types.String }
    },
    status: { type: mongoose_1.default.Schema.Types.String },
    comments: [{
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default },
            comment: { type: mongoose_1.default.Schema.Types.String },
            updateAt: { type: mongoose_1.default.Schema.Types.Date }
        }],
    createdAt: { type: mongoose_1.default.Schema.Types.Date },
    lastUpdatedAt: { type: mongoose_1.default.Schema.Types.Date },
    isDeleted: { type: mongoose_1.default.Schema.Types.Boolean },
}, {
    collection: 'pool-companies',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
PoolCompaniesSchema.plugin(mongoose_unique_validator_1.default);
const PoolCompaniesModel = mongoose_1.default.model('PoolCompaniesSchema', PoolCompaniesSchema);
exports.default = PoolCompaniesModel;
