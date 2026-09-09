"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const organization_1 = __importDefault(require("./organization"));
// Which catalog items a role can see/access, scoped to an organization.
// One document per (organization, role).
const NavRoleAccessSchema = new mongoose_1.default.Schema({
    organization: { type: mongoose_1.default.Schema.Types.ObjectId, ref: organization_1.default, required: true },
    role: { type: mongoose_1.default.Schema.Types.String, required: true },
    navKeys: [{ type: mongoose_1.default.Schema.Types.String }]
}, {
    collection: 'nav-role-access',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
NavRoleAccessSchema.index({ organization: 1, role: 1 }, { unique: true });
const NavRoleAccessModel = mongoose_1.default.model('NavRoleAccessModel', NavRoleAccessSchema);
exports.default = NavRoleAccessModel;
