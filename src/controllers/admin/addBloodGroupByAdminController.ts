import { Request, Response } from "express";
import addBloodgroupByAdminService from "../../services/admin/addBloodGroupByAdminService";
import { BLOOD_GROUP_SUCCESS_MESSAGES, BLOOD_GROUP_ERROR_MESSAGES } from "../../constants/admin/bloodgroupMessages";

const addNewBloodgroupByAdmin = (req: Request, res: Response) => {
    addBloodgroupByAdminService
        .addBloodgroupByAdmin(req.body.type)
        .then((responseAfterBloodGroupAdded) => {
            if (responseAfterBloodGroupAdded.id) {
                return res
                    .status(201)
                    .json({ message: BLOOD_GROUP_SUCCESS_MESSAGES.BLOOD_GROUP_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json({ message: BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_UNEXPECTED_ERROR_MESSAGE });
        });
};

export default { addNewBloodgroupByAdmin };
