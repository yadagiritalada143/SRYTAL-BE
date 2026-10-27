"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poolCompanies_1 = __importDefault(require("../../model/poolCompanies"));
const getPoolCompanyDetails = () => {
    return new Promise((resolve, reject) => {
        poolCompanies_1.default
            .find()
            .then((poolCompaniesResponse) => {
            if (!poolCompaniesResponse) {
                reject({ success: false });
            }
            const responseToSendBack = poolCompaniesResponse.map((eachCompanyDetails) => {
                return {
                    id: eachCompanyDetails._id,
                    companyName: eachCompanyDetails.companyName,
                    primaryContact: eachCompanyDetails.primaryContact,
                    secondaryContact_1: eachCompanyDetails.secondaryContact_1,
                    secondaryContact_2: eachCompanyDetails.secondaryContact_2,
                    status: eachCompanyDetails.status,
                    createdAt: eachCompanyDetails.createdAt,
                    lastUpdatedAt: eachCompanyDetails.lastUpdatedAt
                };
            });
            resolve({ success: true, poolCompaniesResponse: responseToSendBack });
        })
            .catch((error) => {
            console.error(`Error in fetching pool companies list at service level: ${error}`);
            reject({ success: false });
        });
    });
};
const getPoolCompanyDetailsById = async (id) => {
    let poolCompanyDetails = await poolCompanies_1.default
        .findOne({ _id: id })
        .populate('comments.userId', 'firstName lastName');
    if (poolCompanyDetails && poolCompanyDetails.comments) {
        poolCompanyDetails.comments.sort((a, b) => b.updateAt - a.updateAt);
    }
    return poolCompanyDetails;
};
const addPoolCompany = async (companyDetailsToAdd) => {
    companyDetailsToAdd.createdAt = new Date();
    companyDetailsToAdd.lastUpdatedAt = new Date();
    const poolCompanyDataToSave = new poolCompanies_1.default(Object.assign({}, companyDetailsToAdd));
    const result = await poolCompanyDataToSave.save();
    return result;
};
exports.default = { getPoolCompanyDetails, getPoolCompanyDetailsById, addPoolCompany };
