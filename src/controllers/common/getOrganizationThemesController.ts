import { Request, Response } from 'express';
import getOrganizationThemesService from '../../services/common/getOrganizationThemesService';
import { ORGANIZATION_THEMES_ERROR_MESSAGES } from '../../constants/commonErrorMessages';

const getOrganizationThemes = (req: Request, res: Response): any => {
  const { organization_name } = req.params;
  getOrganizationThemesService
    .getOrgThemes(organization_name)
    .then((themesResponse: any) => {
      res.status(200).json({ success: true, themesResponse });
    })
    .catch((error: any) => {
      console.error(error);
      res
        .status(500)
        .json({
          success: false,
          message: ORGANIZATION_THEMES_ERROR_MESSAGES.THEMES_FETCHING_ERROR,
        });
    });
};

export default { getOrganizationThemes };
