import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES, NAV_SUCCESS_MESSAGES } from '../../constants/navigation/navMessages';
import updateNavUserAccessService from '../../services/admin/updateNavUserAccessService';

const updateNavUserAccess = (req: Request, res: Response) => {
    const { userId, addedKeys, removedKeys } = req.body;
    if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'userId is required' });
    }
    updateNavUserAccessService
        .updateNavUserAccess(req.user?.organizationId as string, userId, addedKeys || [], removedKeys || [])
        .then(result => res.status(HTTP_STATUS.OK).json({ ...result, message: NAV_SUCCESS_MESSAGES.USER_ACCESS_UPDATED }))
        .catch(error => {
            console.error(`Error in updating user nav access: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: NAV_ERROR_MESSAGES.USER_ACCESS_UPDATE_ERROR });
        });
};

export default { updateNavUserAccess };
