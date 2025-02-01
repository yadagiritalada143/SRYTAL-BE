"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodGroupModel_1 = __importDefault(require("../../model/bloodGroupModel"));
const getAllBloodgroupsByAdmin = () => {
    return new Promise((resolve, reject) => {
        bloodGroupModel_1.default.find({})
            .then((bloodGroupsList) => {
            if (!bloodGroupsList) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    bloodGroupList: bloodGroupsList
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching Blood Group details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllBloodgroupsByAdmin };
