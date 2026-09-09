import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES } from '../../constants/navigation/navMessages';
import getNavUserAccessService from '../../services/admin/getNavUserAccessService';

const getNavUserAccess = (req: Request, res: Response) => {
    getNavUserAccessService
        .getNavUserAccess(req.user?.organizationId as string, req.params.userId)
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(error => {
            console.error(`Error in fetching user nav access: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: NAV_ERROR_MESSAGES.USER_ACCESS_FETCH_ERROR });
        });
};

export default { getNavUserAccess };
