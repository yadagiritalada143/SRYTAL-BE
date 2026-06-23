import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES } from '../../constants/navigation/navMessages';
import getMyNavMenuService from '../../services/common/getMyNavMenuService';

const getMyNavMenu = (req: Request, res: Response) => {
    getMyNavMenuService
        .getMyNavMenu(req.user?.userId as string, req.user?.organizationId as string)
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(error => {
            console.error(`Error in fetching navigation menu: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: NAV_ERROR_MESSAGES.MENU_FETCH_ERROR });
        });
};

export default { getMyNavMenu };
