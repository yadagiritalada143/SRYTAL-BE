"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const organization_1 = __importDefault(require("./organization"));
const userModel_1 = __importDefault(require("./userModel"));
// Per-user overrides on top of the role grant: extra items granted (addedKeys)
// and specific items revoked (removedKeys). One document per overridden user.
const NavUserAccessSchema = new mongoose_1.default.Schema({
    organization: { type: mongoose_1.default.Schema.Types.ObjectId, ref: organization_1.default, required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default, required: true },
    addedKeys: [{ type: mongoose_1.default.Schema.Types.String }],
    removedKeys: [{ type: mongoose_1.default.Schema.Types.String }]
}, {
    collection: 'nav-user-access',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
NavUserAccessSchema.index({ organization: 1, userId: 1 }, { unique: true });
const NavUserAccessModel = mongoose_1.default.model('NavUserAccessModel', NavUserAccessSchema);
exports.default = NavUserAccessModel;
