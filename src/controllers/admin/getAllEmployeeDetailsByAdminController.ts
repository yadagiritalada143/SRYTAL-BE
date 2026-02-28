import { Request, Response } from 'express';
import { COMMON_ERRORS, HTTP_STATUS } from '../../constants/commonErrorMessages';
import allEmployeeDetailsServices from '../../services/admin/getAllEmployeeDetailsByAdminService'

const getAllEmployeeDetails = async (req: Request, res: Response) => {
    try {
        const { organizationId, userId } = req.user || {};

        const fetchAllEmployeeDetailsByAdminResponse =
            await allEmployeeDetailsServices.getAllEmployeeDetailsByAdmin(
                organizationId as string,
                userId as string
            );

        res.status(HTTP_STATUS.OK).json(fetchAllEmployeeDetailsByAdminResponse);
    } catch (error) {
        console.error(`Error in fetching Employee details: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COMMON_ERRORS.USER_FETCHING_ERROR,
        });
    }
};


export default { getAllEmployeeDetails }
