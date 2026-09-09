"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
const navRoleAccessModel_1 = __importDefault(require("../../model/navRoleAccessModel"));
const navResolver_1 = require("../navigation/navResolver");
// Upserts the role grant. System items for the surface are always kept so an
// admin can never strip a non-revocable item (e.g. the Menu Access page itself).
const updateNavRoleAccess = async (organizationId, role, navKeys) => {
    const surface = (0, navResolver_1.surfaceForRole)(role);
    const systemItems = await navItemModel_1.default.find({ surface, isSystem: true }).select('key').lean();
    const systemKeys = systemItems.map(i => i.key);
    const finalKeys = Array.from(new Set([...(navKeys || []), ...systemKeys]));
    const updated = await navRoleAccessModel_1.default.findOneAndUpdate({ organization: organizationId, role }, { organization: organizationId, role, navKeys: finalKeys }, { new: true, upsert: true }).lean();
    return { success: true, roleAccess: updated };
};
exports.default = { updateNavRoleAccess };
