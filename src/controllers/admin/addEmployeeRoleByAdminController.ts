import { Request, Response } from "express";
import addEmployeeRoleByAdminService from "../../services/admin/addEmployeeRoleByAdminService";
import { EMPLOYEE_ROLE_SUCCESS_MESSAGES, EMPLOYEE_ROLE_ERRORS_MESSAGES } from "../../constants/admin/employmenttypeMessages";

const addEmployeeRoleByAdmin = (req: Request, res: Response) => {
    const { designation } = req.body;
    addEmployeeRoleByAdminService
        .addEmployeeRoleByAdmin(designation)
        .then((responseAfteraddingEmployeeRole) => {
            if (responseAfteraddingEmployeeRole.id) {
                return res
                    .status(201)
                    .json({ message: EMPLOYEE_ROLE_SUCCESS_MESSAGES.EMPLOYEE_ROLE_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

export default { addEmployeeRoleByAdmin };
