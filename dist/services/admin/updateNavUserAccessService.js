"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
const navUserAccessModel_1 = __importDefault(require("../../model/navUserAccessModel"));
const navResolver_1 = require("../navigation/navResolver");
// Upserts a user's overrides. A system item can never be revoked, so any such key
// is stripped from removedKeys before saving.
const updateNavUserAccess = async (organizationId, userId, addedKeys, removedKeys) => {
    const user = await userModel_1.default.findById(userId).select('userRole').lean();
    const surface = (0, navResolver_1.surfaceForRole)(user === null || user === void 0 ? void 0 : user.userRole);
    const systemItems = await navItemModel_1.default.find({ surface, isSystem: true }).select('key').lean();
    const systemKeys = new Set(systemItems.map(i => i.key));
    const cleanAdded = Array.from(new Set(addedKeys || []));
    const cleanRemoved = Array.from(new Set(removedKeys || [])).filter(k => !systemKeys.has(k));
    const updated = await navUserAccessModel_1.default.findOneAndUpdate({ organization: organizationId, userId }, { organization: organizationId, userId, addedKeys: cleanAdded, removedKeys: cleanRemoved }, { new: true, upsert: true }).lean();
    return { success: true, userAccess: updated };
};
exports.default = { updateNavUserAccess };
