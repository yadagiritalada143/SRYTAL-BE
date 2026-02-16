"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addPackageByAdminService_1 = __importDefault(require("../../services/admin/addPackageByAdminService"));
const packageMessages_1 = require("../../constants/admin/packageMessages");
const addPackageByAdminController = async (req, res) => {
    try {
        const addPackageDetails = req.body;
        addPackageDetails.isDeleted = false;
        await addPackageByAdminService_1.default.addPackageByAdmin(addPackageDetails);
        res.status(packageMessages_1.HTTP_STATUS.OK).json({ success: true, message: packageMessages_1.PACKAGE_SUCCESS_MESSAGES.PACKAGE_ADD_SUCCESS_MESSAGE });
    }
    catch (error) {
        console.error(`Error while adding packages: ${error}`);
        res.status(packageMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_ADD_ERROR_MESSAGE, });
    }
};
exports.default = { addPackageByAdminController };
