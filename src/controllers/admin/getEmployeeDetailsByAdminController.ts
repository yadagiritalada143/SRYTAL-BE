import { Request, Response } from 'express';
import adminService from '../../services/admin/getUserDetailsByAdminService';
import { COMMON_ERRORS } from '../../constants/commonErrorMessages';

const getUserDetails = (req: Request, res: Response) => {
  adminService
    .getEmployeeDetailsByAdmin(req.params.id)
    .then((fetchUserDetailsResponse) => {
      res.status(200).json(fetchUserDetailsResponse);
    })
    .catch((error) => {
      console.error(`Error in fetching user details: ${error}`);
      res
        .status(500)
        .json({ success: false, message: COMMON_ERRORS.USER_FETCHING_ERROR });
    });
};

export default { getUserDetails };
