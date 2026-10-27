"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const updateAppWalkThrough = async (applicationWalkThroughToUpdate) => {
    try {
        const result = await userModel_1.default.updateOne({ _id: applicationWalkThroughToUpdate.user_id }, { applicationWalkThrough: Number(applicationWalkThroughToUpdate.applicationWalkThrough) });
        return result;
    }
    catch (error) {
        console.error(`Error occured while updating applicationwalk through: ${error}`);
        return error;
    }
};
exports.default = { updateAppWalkThrough };
