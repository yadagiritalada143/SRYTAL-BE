"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talentPoolCandidatesModel_1 = __importDefault(require("../../model/talentPoolCandidatesModel"));
const hardDeletePoolCandidateByAdmin = async (poolCandidateIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await talentPoolCandidatesModel_1.default.deleteOne({ _id: poolCandidateIdToDelete })
            .then((responseAfterPoolCandidateHardDelete) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in hard deleting pool candidate: ${error}`);
            reject({ success: false });
        });
    });
};
const softDeletePoolCandidateByAdmin = async (poolCandidateIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await talentPoolCandidatesModel_1.default.updateOne({ _id: poolCandidateIdToDelete }, { isDeleted: true })
            .then((responseAfterPoolCandidateSoftDelete) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in soft deleting pool candidate: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { hardDeletePoolCandidateByAdmin, softDeletePoolCandidateByAdmin };
