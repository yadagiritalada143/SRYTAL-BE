"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrganizationSchema = new mongoose_1.default.Schema({
    organizationName: { type: mongoose_1.default.Schema.Types.String, required: true },
}, {
    collection: 'organization',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const Organization = mongoose_1.default.model('OrganizationSchema', OrganizationSchema);
exports.default = Organization;
