"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
const navRoleAccessModel_1 = __importDefault(require("../../model/navRoleAccessModel"));
const navResolver_1 = require("../navigation/navResolver");
// Returns the catalog keys granted to a role in this org. If no explicit grant
// exists yet, defaults to the full surface catalog (matches runtime fallback).
const getNavRoleAccess = async (organizationId, role) => {
    const surface = (0, navResolver_1.surfaceForRole)(role);
    const access = await navRoleAccessModel_1.default.findOne({ organization: organizationId, role }).lean();
    let navKeys = access === null || access === void 0 ? void 0 : access.navKeys;
    let isDefault = false;
    if (!access) {
        const catalog = await navItemModel_1.default.find({ surface }).select('key').lean();
        navKeys = catalog.map(i => i.key);
        isDefault = true;
    }
    return { success: true, role, surface, navKeys: navKeys || [], isDefault };
};
exports.default = { getNavRoleAccess };
