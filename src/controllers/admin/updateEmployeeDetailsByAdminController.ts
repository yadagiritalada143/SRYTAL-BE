import { Request, Response } from 'express';
import adminService from '../../services/admin/updateEmployeeDetailsByAdminService';
import { COMMON_ERRORS, HTTP_STATUS } from '../../constants/commonErrorMessages';

const updateProfile = async (req: Request, res: Response) => {
    try {
        const updateProfileResponse = await adminService.updateEmployeeProfileByAdmin(req.body);
        res.status(HTTP_STATUS.OK).json(updateProfileResponse);
    } catch (error: any) {
        console.error(`Error in updating profile details: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: COMMON_ERRORS.USER_UPDATING_ERROR });
    }
};


export default { updateProfile };