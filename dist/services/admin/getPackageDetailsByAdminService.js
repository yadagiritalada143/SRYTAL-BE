"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const getPackageDetailsByAdmin = (id) => {
    return new Promise((resolve, reject) => {
        packageModel_1.default.findById({ _id: id })
            .populate({
            path: 'tasks',
            populate: {
                path: 'createdBy',
                select: 'firstName lastName',
            },
        })
            .populate('approvers', 'firstName lastName')
            .then((packageDetails) => {
            if (!packageDetails) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    packageDetails: packageDetails
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching Pacakge details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getPackageDetailsByAdmin };
