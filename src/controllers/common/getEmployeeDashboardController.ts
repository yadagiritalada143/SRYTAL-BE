import { Request, Response } from 'express';
import { EMPLOYEE_ERRORS, HTTP_STATUS } from '../../constants/commonErrorMessages';
import getEmployeeDashboardService from '../../services/common/getEmployeeDashboardService';

const getEmployeeDashboard = (req: Request, res: Response) => {
    getEmployeeDashboardService
        .getEmployeeDashboard(req.user?.userId as string)
        .then(dashboardResponse => {
            res.status(HTTP_STATUS.OK).json(dashboardResponse);
        })
        .catch(error => {
            console.error(`Error in fetching employee dashboard: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_DASHBOARD_FETCHING_ERROR });
        });
};

export default { getEmployeeDashboard };
