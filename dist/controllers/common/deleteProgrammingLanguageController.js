"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteProgrammingLanguageService_1 = __importDefault(require("../../services/common/deleteProgrammingLanguageService"));
const programmingLanguagesMessages_1 = require("../../constants/common/programmingLanguagesMessages");
const deleteProgrammingLanguage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProgrammingLanguage = await deleteProgrammingLanguageService_1.default.deleteProgrammingLanguage(id);
        if (!deletedProgrammingLanguage) {
            return res.status(programmingLanguagesMessages_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_NOT_FOUND_MESSAGE });
        }
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.OK).json({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_SUCCESS_MESSAGE, data: deletedProgrammingLanguage });
    }
    catch (error) {
        console.error(`Error while deleting programming language: ${error}`);
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_ERROR_MESSAGE });
    }
};
exports.default = { deleteProgrammingLanguage };
