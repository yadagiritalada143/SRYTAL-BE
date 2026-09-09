import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES } from '../../constants/navigation/navMessages';
import getNavRoleAccessService from '../../services/admin/getNavRoleAccessService';

const getNavRoleAccess = (req: Request, res: Response) => {
    getNavRoleAccessService
        .getNavRoleAccess(req.user?.organizationId as string, req.params.role)
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(error => {
            console.error(`Error in fetching role nav access: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: NAV_ERROR_MESSAGES.ROLE_ACCESS_FETCH_ERROR });
        });
};

export default { getNavRoleAccess };
