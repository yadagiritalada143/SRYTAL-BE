"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poolCompanies_1 = __importDefault(require("../../model/poolCompanies"));
const updatePoolCompanyDetails = async (detailsToUpdate) => {
    try {
        detailsToUpdate.lastUpdatedAt = new Date();
        const result = await poolCompanies_1.default.updateOne({ _id: detailsToUpdate.id }, detailsToUpdate);
        return { success: result.acknowledged };
    }
    catch (error) {
        console.error('Error occured while updating the pool company details:', error);
        return { success: false };
    }
};
exports.default = { updatePoolCompanyDetails };
