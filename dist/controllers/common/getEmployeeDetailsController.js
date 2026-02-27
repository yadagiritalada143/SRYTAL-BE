"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getEmployeeDetailsService_1 = __importDefault(require("../../services/common/getEmployeeDetailsService"));
const getEmployeeDetails = (req, res) => {
    getEmployeeDetailsService_1.default
        .getEmployeeDetails(req.body.userId)
        .then(getEmployeeDetailsResponse => {
        res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(getEmployeeDetailsResponse);
    })
        .catch(error => {
        console.error(`Error in fetching employee details: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_DETAILS_FETCHING_ERROR });
    });
};
exports.default = { getEmployeeDetails };
