"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../model/userModel"));
/**
 * Enforces that the authenticated user has an Admin role before allowing
 * access to an admin-only endpoint. `validateJWT` only proves identity, so we
 * load the user here to assert the role. SuperAdmin is treated as an admin
 * surface (consistent with the rest of the codebase, e.g. salary slip access).
 */
const ADMIN_ROLES = ['admin'];
const authorizeAdmin = async (req, res, next) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    try {
        const user = await userModel_1.default.findById(userId).select('userRole').lean();
        if (!user || !ADMIN_ROLES.includes(user.userRole || '')) {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }
        next();
    }
    catch (error) {
        console.error(`Error in authorizeAdmin middleware: ${error}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.default = authorizeAdmin;
