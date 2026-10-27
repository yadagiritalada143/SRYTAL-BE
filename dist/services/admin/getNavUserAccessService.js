"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
const navRoleAccessModel_1 = __importDefault(require("../../model/navRoleAccessModel"));
const navUserAccessModel_1 = __importDefault(require("../../model/navUserAccessModel"));
const navResolver_1 = require("../navigation/navResolver");
// Returns, for one employee, the role-inherited baseline keys plus their
// per-user added/removed overrides — everything the admin UI needs to render the
// per-user editor.
const getNavUserAccess = async (organizationId, userId) => {
    const user = await userModel_1.default.findById(userId).select('userRole firstName lastName').lean();
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    const role = user.userRole || '';
    const surface = (0, navResolver_1.surfaceForRole)(role);
    const [roleAccess, userAccess] = await Promise.all([
        navRoleAccessModel_1.default.findOne({ organization: organizationId, role }).lean(),
        navUserAccessModel_1.default.findOne({ organization: organizationId, userId }).lean()
    ]);
    let roleKeys = roleAccess === null || roleAccess === void 0 ? void 0 : roleAccess.navKeys;
    if (!roleAccess) {
        const catalog = await navItemModel_1.default.find({ surface }).select('key').lean();
        roleKeys = catalog.map(i => i.key);
    }
    return {
        success: true,
        userId,
        role,
        surface,
        roleKeys: roleKeys || [],
        addedKeys: (userAccess === null || userAccess === void 0 ? void 0 : userAccess.addedKeys) || [],
        removedKeys: (userAccess === null || userAccess === void 0 ? void 0 : userAccess.removedKeys) || []
    };
};
exports.default = { getNavUserAccess };
