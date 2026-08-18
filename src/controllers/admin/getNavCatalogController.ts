import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES } from '../../constants/navigation/navMessages';
import getNavCatalogService from '../../services/admin/getNavCatalogService';

const getNavCatalog = (req: Request, res: Response) => {
    getNavCatalogService
        .getNavCatalog(req.query.surface as string | undefined)
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(error => {
            console.error(`Error in fetching nav catalog: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: NAV_ERROR_MESSAGES.CATALOG_FETCH_ERROR });
        });
};

export default { getNavCatalog };
