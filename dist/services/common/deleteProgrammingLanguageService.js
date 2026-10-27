"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const deleteProgrammingLanguage = async (id) => {
    try {
        const result = await programmingLanguagesModel_1.default.findByIdAndDelete({ _id: id });
        return result;
    }
    catch (error) {
        console.error(`Error while deleting programming language: ${error}`);
        throw error;
    }
};
exports.default = { deleteProgrammingLanguage };
