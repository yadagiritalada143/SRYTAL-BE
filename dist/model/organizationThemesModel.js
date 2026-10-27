"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const OrganizationThemesSchema = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    organization_name: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    organization_theme: {
        organization: { type: mongoose_1.default.Schema.Types.String },
        logo: { type: mongoose_1.default.Schema.Types.String },
        theme: {
            primaryColor: { type: mongoose_1.default.Schema.Types.String },
            colorScheme: { type: mongoose_1.default.Schema.Types.String },
            fontFamily: { type: mongoose_1.default.Schema.Types.String },
            button: {
                color: { type: mongoose_1.default.Schema.Types.String },
                textColor: { type: mongoose_1.default.Schema.Types.String },
            },
            colors: {
                primary: [{ type: mongoose_1.default.Schema.Types.String }],
                secondary: [{ type: mongoose_1.default.Schema.Types.String }]
            },
            color: { type: mongoose_1.default.Schema.Types.String },
            backgroundColor: { type: mongoose_1.default.Schema.Types.String },
            borderColor: { type: mongoose_1.default.Schema.Types.String },
            linkColor: { type: mongoose_1.default.Schema.Types.String },
            headerBackgroundColor: { type: mongoose_1.default.Schema.Types.String },
        }
    }
}, {
    collection: 'organization-themes',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
OrganizationThemesSchema.plugin(mongoose_unique_validator_1.default);
const OrganizationThemesModel = mongoose_1.default.model('OrganizationThemesSchema', OrganizationThemesSchema);
exports.default = OrganizationThemesModel;
