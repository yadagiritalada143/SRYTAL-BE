"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
const navResolver_1 = require("../navigation/navResolver");
const getMyNavMenu = async (userId, organizationId) => {
    const user = await userModel_1.default.findById(userId).select('userRole organization').lean();
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    const role = user.userRole || '';
    const orgId = organizationId || String(user.organization || '');
    const surface = (0, navResolver_1.surfaceForRole)(role);
    const effectiveKeys = await (0, navResolver_1.resolveEffectiveKeys)(orgId, role, userId, surface);
    // All catalog items for the surface — needed so the client guard can tell a
    // "managed" menu page (block if not granted) from an unmanaged action/detail
    // page (always allowed, reached from within a granted section).
    const allSurfaceItems = await navItemModel_1.default.find({ surface }).lean();
    const items = allSurfaceItems.filter(i => effectiveKeys.has(i.key));
    const menu = (0, navResolver_1.buildMenuTree)(items);
    const allowedUrls = (0, navResolver_1.collectUrls)(menu);
    const managedUrls = allSurfaceItems.map(i => i.url).filter((u) => !!u);
    return { success: true, surface, menu, allowedUrls, managedUrls };
};
exports.default = { getMyNavMenu };
