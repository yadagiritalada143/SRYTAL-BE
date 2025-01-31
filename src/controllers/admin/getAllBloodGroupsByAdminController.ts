import { Request, Response } from 'express';
import { COMMON_ERRORS } from '../../constants/commonErrorMessages';
import allEmployeeBloodGroupServices from '../../services/admin/getAllBloodGroupsByAdminService'

const getAllBloodGroupsDetails = (req: Request, res: Response) => {
    const { organizationId, userId } = req.body;
    allEmployeeBloodGroupServices
        .getAllBloodGroupsByAdmin(organizationId, userId)
        .then(fetchAllBloodGroupsByAdminResponse => {
            res.status(200).json(fetchAllBloodGroupsByAdminResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Blood Group details: ${error}`);
            res.status(500).json({ success: false, message: COMMON_ERRORS.USER_FETCHING_ERROR });
        });
};

export default { getAllBloodGroupsDetails }