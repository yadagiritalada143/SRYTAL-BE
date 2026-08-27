import { Request, Response, NextFunction } from 'express';
import UserModel from '../model/userModel';

const validateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.userId;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!user.userRole) {
            return res.status(403).json({
                success: false,
                message: 'User role not found',
            });
        }

        if (user.userRole.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only Admin users can access this resource.',
            });
        }

        next();

    } catch (error: any) {
        console.error(
            `Error while validating admin: ${error.message}`
        );

        return res.status(500).json({
            success: false,
            message: 'Error while validating user role',
        });
    }
};

export default validateAdmin;