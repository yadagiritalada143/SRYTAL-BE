"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const hardDeletePackageServiceByAdmin = async (packageIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await packageModel_1.default.deleteOne({ _id: packageIdToDelete })
            .then((responseAfterHardDeletingPackage) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in hard deleting package: ${error}`);
            reject({ success: false });
        });
    });
};
const softDeletePackageServiceByAdmin = async (packageIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await packageModel_1.default.updateOne({ _id: packageIdToDelete }, { isDeleted: true })
            .then((responseAfterSoftDeletingPackage) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in soft deleting package: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { hardDeletePackageServiceByAdmin, softDeletePackageServiceByAdmin };
