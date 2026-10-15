"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const getProgrammingLanguageById = async (id) => {
    try {
        const programmingLanguage = await programmingLanguagesModel_1.default.findById({ _id: id });
        return programmingLanguage;
    }
    catch (error) {
        console.error(`Error while fetching programming language by id: ${error}`);
        throw error;
    }
};
exports.default = { getProgrammingLanguageById };
