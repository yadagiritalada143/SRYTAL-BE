import { Request, Response } from 'express';
import getEmployeeSalarySlip from '../../services/common/getEmployeeSalrySlipService';
import { EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES, EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES, HTTP_STATUS } from './../../constants/common/employeeSalarySlipMessage';

const getEmployeeSalarySlipController = async (req: Request, res: Response): Promise<any> => {
    try {
        const {mongoId} = req.params ;
        const salarySlips = await getEmployeeSalarySlip.getEmployeeSalarySlipService(mongoId);
        res.status(HTTP_STATUS.OK).json({ success: true, message: EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES.EMPLOYEE_SALARY_SLIPS_FETCHED_SUCCESSFULLY, data: salarySlips });

    } catch (error: any) {
        console.error(`Error in getEmployeeSalarySlipController: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIPS_FETCHING_ERROR });
    }

};

export default { getEmployeeSalarySlipController };
