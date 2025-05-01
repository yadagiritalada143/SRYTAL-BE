"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const getAllPackagesByAdmin = () => {
    return new Promise((resolve, reject) => {
        packageModel_1.default.find({})
            .populate({
            path: 'tasks',
            populate: {
                path: 'createdBy',
                select: 'firstName lastName',
            },
        })
            .populate('approvers', 'firstName lastName')
            .then((pacakgesList) => {
            if (!pacakgesList) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    pacakgesList: pacakgesList
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching Pacakges details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllPackagesByAdmin };
