"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getAllBloodGroupsByAdminService_1 = __importDefault(require("../../services/admin/getAllBloodGroupsByAdminService"));
const getAllBloodGroupsDetails = (req, res) => {
    getAllBloodGroupsByAdminService_1.default.getAllBloodgroupsByAdmin()
        .then(fetchAllBloodGroupsByAdminResponse => {
        res.status(200).json(fetchAllBloodGroupsByAdminResponse);
    })
        .catch(error => {
        console.error(`Error in fetching Blood Group details: ${error}`);
        res.status(500).json({ success: false, message: commonErrorMessages_1.BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_FETCH_ERROR_MESSAGES });
    });
};
exports.default = { getAllBloodGroupsDetails };
