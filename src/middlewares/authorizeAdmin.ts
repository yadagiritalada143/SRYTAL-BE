import { Request, Response, NextFunction } from 'express';
import UserModel from '../model/userModel';

/**
 * Enforces that the authenticated user has an Admin role before allowing
 * access to an admin-only endpoint. `validateJWT` only proves identity, so we
 * load the user here to assert the role. SuperAdmin is treated as an admin
 * surface (consistent with the rest of the codebase, e.g. salary slip access).
 */
const ADMIN_ROLES = ['admin'];

const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }

    try {
        const user = await UserModel.findById(userId).select('userRole').lean();

        if (!user || !ADMIN_ROLES.includes(user.userRole || '')) {
            return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
        }

        next();
    } catch (error) {
        console.error(`Error in authorizeAdmin middleware: ${error}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default authorizeAdmin;
