"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addBloodGroupByAdminService_1 = __importDefault(require("../../services/admin/addBloodGroupByAdminService"));
const bloodgroupMessages_1 = require("../../constants/admin/bloodgroupMessages");
const addNewBloodgroupByAdmin = (req, res) => {
    addBloodGroupByAdminService_1.default
        .addBloodgroupByAdmin(req.body.type)
        .then((responseAfterBloodGroupAdded) => {
        if (responseAfterBloodGroupAdded.id) {
            return res
                .status(201)
                .json({ message: bloodgroupMessages_1.BLOOD_GROUP_SUCCESS_MESSAGES.BLOOD_GROUP_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res
                .status(400)
                .json({ message: bloodgroupMessages_1.BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_ADD_ERROR_MESSAGE });
        }
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ message: bloodgroupMessages_1.BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_UNEXPECTED_ERROR_MESSAGE });
    });
};
exports.default = { addNewBloodgroupByAdmin };
