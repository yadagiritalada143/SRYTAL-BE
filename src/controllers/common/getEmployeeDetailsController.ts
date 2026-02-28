import { Request, Response } from 'express';
import { EMPLOYEE_ERRORS, HTTP_STATUS } from '../../constants/commonErrorMessages';
import getEmployeeDetailsService from '../../services/common/getEmployeeDetailsService';


const getEmployeeDetails = (req: Request, res: Response) => {
    getEmployeeDetailsService
        .getEmployeeDetails(req.user?.userId as string)
        .then(getEmployeeDetailsResponse => {
            res.status(HTTP_STATUS.OK).json(getEmployeeDetailsResponse);
        })
        .catch(error => {
            console.error(`Error in fetching employee details: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_DETAILS_FETCHING_ERROR });
        });
}

export default { getEmployeeDetails }
