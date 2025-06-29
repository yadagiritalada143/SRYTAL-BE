"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const taskModel_1 = __importDefault(require("../../model/taskModel"));
const getPackageDetailsByAdmin = async (id) => {
    try {
        const packageDoc = await packageModel_1.default.findById(id)
            .populate('approvers', 'firstName lastName');
        if (!packageDoc) {
            return { success: false };
        }
        const taskDetails = await taskModel_1.default.find({ packageId: id, isDeleted: false }).populate('createdBy', 'firstName lastName');
        const packageDetails = packageDoc.toObject();
        packageDetails.tasks = taskDetails;
        return {
            success: true,
            packageDetails
        };
    }
    catch (error) {
        console.error('Error in fetching Package details:', error);
        return { success: false };
    }
};
exports.default = { getPackageDetailsByAdmin };
