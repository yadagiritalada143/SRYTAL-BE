import { Request, Response } from 'express';
import downloadSalarySlipService from '../../services/common/downloadSalarySlipService';
import { EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES, EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/common/employeeSalarySlipMessage';
import UserModel from '../../model/userModel';

const ADMIN_ROLES = ['admin', 'SuperAdmin'];

const downloadSalarySlipController = async (req: Request, res: Response): Promise<any> => {
    try {
        const { mongoId, fullName, month, year } = req.body;
        const authenticatedUserId = req.body.userId;

        // Validate required fields
        if (!mongoId || !fullName || !month || !year) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.INVALID_REQUEST_PARAMS
            });
        }

        // Security check: Allow Admin/SuperAdmin to access any employee's salary slips
        // Regular employees can only access their own salary slips
        if (mongoId !== authenticatedUserId) {
            const currentUser = await UserModel.findById(authenticatedUserId).select('userRole');

            const isAdmin = currentUser && ADMIN_ROLES.includes(currentUser.userRole || '');

            if (!isAdmin) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.UNAUTHORIZED_ACCESS
                });
            }
        }

        const result = await downloadSalarySlipService.downloadSalarySlipService({ mongoId, fullName, month, year });

        if (!result.success) {
            if (result.error === 'SALARY_SLIP_NOT_FOUND') {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_NOT_FOUND
                });
            }
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED,
            data: {
                downloadUrl: result.downloadUrl,
                fileName: result.fileName
            }
        });

    } catch (error: any) {
        console.error(`Error in downloadSalarySlipController: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR
        });
    }
};

export default { downloadSalarySlipController };
