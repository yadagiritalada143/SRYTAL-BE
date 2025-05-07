import { Request, Response } from "express";
import addPackageToEmployeeByAdminService from "../../services/admin/addPackageToEmployeeByAdminService";
import { PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE } from "../../constants/admin/packageToEmployeeMessage";

const addPackageToEmployeeByAdmin = (req: Request, res: Response) => {
    const addPackagetoEmployeeDetails = req.body;
    addPackageToEmployeeByAdminService
        .addPackagetoEmployeeByAdmin(addPackagetoEmployeeDetails)
        .then((responseAfteraddingPackagesToEmployee: any) => {
            res.status(200).json({ succes: true });
        })
        .catch((error: any) => {
            console.log(`Error while adding packages to employee: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE.ADD_PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE });
        });
};

export default { addPackageToEmployeeByAdmin };
