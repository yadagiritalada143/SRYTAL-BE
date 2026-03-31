"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const updatePackageByAdmin = async (id, detailsToUpdate) => {
    try {
        const result = await packageModel_1.default.updateOne({ _id: id }, Object.assign({}, detailsToUpdate));
        if (result) {
            return { success: true, responseAfterUpdate: result };
        }
        else {
            return { success: false };
        }
    }
    catch (error) {
        console.error(`Error in updating packages: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
};
exports.default = { updatePackageByAdmin };
