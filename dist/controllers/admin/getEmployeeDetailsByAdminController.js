"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserDetailsByAdminService_1 = __importDefault(require("../../services/admin/getUserDetailsByAdminService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getUserDetails = (req, res) => {
    getUserDetailsByAdminService_1.default
        .getEmployeeDetailsByAdmin(req.params.id)
        .then(fetchUserDetailsResponse => {
        res.status(200).json(fetchUserDetailsResponse);
    })
        .catch(error => {
        console.error(`Error in fetching user details: ${error}`);
        res.status(500).json({ success: false, message: commonErrorMessages_1.COMMON_ERRORS.USER_FETCHING_ERROR });
    });
};
exports.default = { getUserDetails };
