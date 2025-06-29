"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addPackageToEmployeeByAdminService_1 = __importDefault(require("../../services/admin/addPackageToEmployeeByAdminService"));
const packageToEmployeeMessage_1 = require("../../constants/admin/packageToEmployeeMessage");
const addPackageToEmployeeByAdmin = (req, res) => {
    const addPackagetoEmployeeDetails = req.body;
    addPackageToEmployeeByAdminService_1.default
        .addPackagetoEmployeeByAdmin(addPackagetoEmployeeDetails)
        .then((responseAfteraddingPackagesToEmployee) => {
        res.status(200).json({ succes: true });
    })
        .catch((error) => {
        console.log(`Error while adding packages to employee: ${error}`);
        res.status(500).json({ success: false, message: packageToEmployeeMessage_1.PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE.ADD_PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE });
    });
};
exports.default = { addPackageToEmployeeByAdmin };
