import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES, NAV_SUCCESS_MESSAGES } from '../../constants/navigation/navMessages';
import updateNavRoleAccessService from '../../services/admin/updateNavRoleAccessService';

const updateNavRoleAccess = (req: Request, res: Response) => {
    const { role, navKeys } = req.body;
    if (!role) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'role is required' });
    }
    updateNavRoleAccessService
        .updateNavRoleAccess(req.user?.organizationId as string, role, navKeys || [])
        .then(result => res.status(HTTP_STATUS.OK).json({ ...result, message: NAV_SUCCESS_MESSAGES.ROLE_ACCESS_UPDATED }))
        .catch(error => {
            console.error(`Error in updating role nav access: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: NAV_ERROR_MESSAGES.ROLE_ACCESS_UPDATE_ERROR });
        });
};

export default { updateNavRoleAccess };
