import { Request, Response } from "express";
import addPackageByAdminService from "../../services/admin/addPackageByAdminService";
import { PACKAGE_ERROR_MESSAGES, PACKAGE_SUCCESS_MESSAGES, HTTP_STATUS } from "../../constants/admin/packageMessages";

// const addPackageByAdminController = (req: Request, res: Response) => {
//     const addPackageDetails = req.body;
//     addPackageDetails.isDeleted = false;
//     addPackageByAdminService
//         .addPackageByAdmin(addPackageDetails)
//         .then((responseAfteraddingPackages: any) => {
//             res.status(200).json({ succes: true });
//         })
//         .catch((error: any) => {
//             console.error(`Error while adding packages: ${error}`);
//             res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_ADD_ERROR_MESSAGE });
//         });
// };
const addPackageByAdminController = async (req: Request, res: Response) => {
    try{
        const addPackageDetails = req.body;
         addPackageDetails.isDeleted = false;
         await addPackageByAdminService.addPackageByAdmin(addPackageDetails);
         res.status(HTTP_STATUS.OK).json({ success: true, message:PACKAGE_SUCCESS_MESSAGES.PACKAGE_ADD_SUCCESS_MESSAGE });

    } catch(error) {
        console.error(`Error while adding packages: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false,  message: PACKAGE_ERROR_MESSAGES.PACKAGE_ADD_ERROR_MESSAGE,})
    }
}

export default { addPackageByAdminController };
