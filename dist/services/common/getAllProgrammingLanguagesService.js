"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const getAllProgrammingLanguages = async () => {
    try {
        const programmingLanguages = await programmingLanguagesModel_1.default.find({});
        return programmingLanguages;
    }
    catch (error) {
        console.error(`Error while fetching programming languages: ${error}`);
        throw error;
    }
};
exports.default = { getAllProgrammingLanguages };
