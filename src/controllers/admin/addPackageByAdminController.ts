import { Request, Response } from "express";
import addPackageByAdminService from "../../services/admin/addPackageByAdminService";
import { PACKAGE_ERROR_MESSAGES,  } from "../../constants/admin/packageMessages";

const addPackageByAdminController = (req: Request, res: Response) => {
    addPackageByAdminService
        .addPackageByAdmin(req.body)
        .then((responseAfteraddingPackages:any) => {
           res.status(200).json({succes:true});
        })
        .catch((error:any) => {
            console.log(`Error while adding packages: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_ADDING_SUCCESS_MESSAGE });
        });
};

export default { addPackageByAdminController };
