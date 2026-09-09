import { Request, Response } from 'express';
import { COMMON_ERRORS, HTTP_STATUS } from '../../constants/commonErrorMessages';
import getDashboardStatsByAdminService from '../../services/admin/getDashboardStatsByAdminService';

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const { organizationId, userId } = req.user || {};
        const result = await getDashboardStatsByAdminService.getDashboardStatsByAdmin(
            organizationId as string,
            userId as string
        );
        res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
        console.error(`Error in fetching admin dashboard stats: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COMMON_ERRORS.USER_FETCHING_ERROR
        });
    }
};

export default { getDashboardStats };
