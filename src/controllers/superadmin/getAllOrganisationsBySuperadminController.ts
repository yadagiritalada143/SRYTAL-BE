import { Request, Response } from 'express';
import getAllOrganisationsBySuperadminService from '../../services/superadmin/getAllOrganizationsBySuperadminService';

const getAllOrganizationsBySuperadmin = (req: Request, res: Response) => {
  getAllOrganisationsBySuperadminService
    .getAllOrganizationsBySuperadmin()
    .then((organizations) => {
      return res.status(200).json({ organizations });
    })
    .catch(() => {
      return res
        .status(500)
        .json({
          message: 'Error in fetching get organisations by super admin !',
        });
    });
};

export default { getAllOrganizationsBySuperadmin };
