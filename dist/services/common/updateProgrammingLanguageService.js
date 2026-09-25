"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const updateProgrammingLanguage = async (id, languageName) => {
    try {
        const result = await programmingLanguagesModel_1.default.updateOne({ _id: id }, { languageName });
        return result;
    }
    catch (error) {
        console.error(`Error while updating programming language: ${error}`);
        throw new Error('An error occurred while updating programming language.');
    }
};
exports.default = { updateProgrammingLanguage };
