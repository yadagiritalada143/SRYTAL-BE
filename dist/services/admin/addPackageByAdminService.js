"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const addPackageByAdmin = async (data) => {
    const packageData = new packageModel_1.default(data);
    return await packageData.save();
};
exports.default = { addPackageByAdmin };
