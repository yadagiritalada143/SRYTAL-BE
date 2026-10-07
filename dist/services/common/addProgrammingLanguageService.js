"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const addProgrammingLanguage = async (languageName) => {
    try {
        const programmingLanguage = new programmingLanguagesModel_1.default({ languageName });
        const result = await programmingLanguage.save();
        return result;
    }
    catch (error) {
        console.error(`Error while adding programming language: ${error}`);
        throw new Error('An error occurred while adding programming language.');
    }
};
exports.default = { addProgrammingLanguage };
