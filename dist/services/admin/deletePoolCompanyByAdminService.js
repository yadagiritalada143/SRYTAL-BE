"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poolCompanies_1 = __importDefault(require("../../model/poolCompanies"));
const hardDeletePoolCompanyByAdmin = async (poolCompanyIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await poolCompanies_1.default.deleteOne({ _id: poolCompanyIdToDelete })
            .then((responseAfterPoolCandidateHardDelete) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in hard deleting pool company: ${error}`);
            reject({ success: false });
        });
    });
};
const softDeletePoolCompanyByAdmin = async (poolCompanyIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await poolCompanies_1.default.updateOne({ _id: poolCompanyIdToDelete }, { isDeleted: true })
            .then((responseAfterPoolCandidateSoftDelete) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in soft deleting pool company: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { hardDeletePoolCompanyByAdmin, softDeletePoolCompanyByAdmin };
