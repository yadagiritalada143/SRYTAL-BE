import { Request, Response } from 'express';
import { BLOOD_GROUP_ERROR_MESSAGES } from '../../constants/admin/bloodgroupMessages';
import allEmployeeBloodGroupServices from '../../services/admin/getAllBloodGroupsByAdminService'

const getAllBloodGroupsDetails = (req: Request, res: Response) => {
    allEmployeeBloodGroupServices.getAllBloodgroupsByAdmin()
        .then(fetchAllBloodGroupsByAdminResponse => {
            res.status(200).json(fetchAllBloodGroupsByAdminResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Blood Group details: ${error}`);
            res.status(500).json({ success: false, message: BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_FETCH_ERROR_MESSAGES });
        });
};

export default { getAllBloodGroupsDetails }
