"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const bloodGroupModel_1 = __importDefault(require("../model/bloodGroupModel"));
const employmentTypeModel_1 = __importDefault(require("../model/employmentTypeModel"));
const employeeRole_1 = __importDefault(require("../model/employeeRole"));
const organization_1 = __importDefault(require("../model/organization"));
const UserSchema = new mongoose_1.default.Schema({
    employeeId: { type: mongoose_1.default.Schema.Types.String },
    firstName: { type: mongoose_1.default.Schema.Types.String },
    lastName: { type: mongoose_1.default.Schema.Types.String },
    email: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    password: { type: mongoose_1.default.Schema.Types.String },
    mobileNumber: { type: mongoose_1.default.Schema.Types.Number },
    userRole: { type: mongoose_1.default.Schema.Types.String },
    passwordResetRequired: { type: mongoose_1.default.Schema.Types.String },
    bloodGroup: { type: mongoose_1.default.Schema.Types.ObjectId, ref: bloodGroupModel_1.default },
    bankDetailsInfo: {
        bankName: { type: mongoose_1.default.Schema.Types.String },
        accountHolderName: { type: mongoose_1.default.Schema.Types.String },
        accountNumber: { type: mongoose_1.default.Schema.Types.String },
        ifscCode: { type: mongoose_1.default.Schema.Types.String },
    },
    profileImage: { type: mongoose_1.default.Schema.Types.String },
    employmentType: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: employmentTypeModel_1.default,
    },
    employeeRole: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: employeeRole_1.default }],
    organization: { type: mongoose_1.default.Schema.Types.ObjectId, ref: organization_1.default },
    applicationWalkThrough: { type: mongoose_1.default.Schema.Types.Number },
    isDeleted: { type: mongoose_1.default.Schema.Types.Boolean },
    created_on: { type: mongoose_1.default.Schema.Types.Date },
    lastLoggedOn: { type: mongoose_1.default.Schema.Types.Date },
    dateOfBirth: { type: mongoose_1.default.Schema.Types.Date },
    aadharNumber: { type: mongoose_1.default.Schema.Types.String },
    panCardNumber: { type: mongoose_1.default.Schema.Types.String },
    presentAddress: { type: mongoose_1.default.Schema.Types.String },
    permanentAddress: { type: mongoose_1.default.Schema.Types.String },
    refreshToken: { type: mongoose_1.default.Schema.Types.String },
}, {
    collection: 'users',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
UserSchema.plugin(mongoose_unique_validator_1.default);
UserSchema.virtual('id').get(function () {
    return String(this._id);
});
const UserModel = mongoose_1.default.model('UserSchema', UserSchema);
exports.default = UserModel;
