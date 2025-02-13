import { Request, Response } from "express";
import addEmploymentTypeByAdminService from "../../services/admin/addEmploymentTypeByAdminService";
import { EMPLOYMENT_TYPE_SUCCESS_MESSAGES, EMPLOYMENT_TYPE_ERRORS_MESSAGES } from "../../constants/admin/employementTypesMessages";

const addEmploymentTypeByAdmin = (req: Request, res: Response) => {
    const { employmentType } = req.body;
    addEmploymentTypeByAdminService
        .addEmploymentTypeByAdmin(employmentType)
        .then((responseAfteraddingEmploymentType) => {
            if (responseAfteraddingEmploymentType.id) {
                return res
                    .status(201)
                    .json({ message: EMPLOYMENT_TYPE_SUCCESS_MESSAGES.EMPLOYMENT_TYPE_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json({ message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UNEXPECTED_ERROR_MESSAGE });
        });
};

export default { addEmploymentTypeByAdmin };
