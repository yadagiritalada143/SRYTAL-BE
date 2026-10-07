"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateProgrammingLanguageService_1 = __importDefault(require("../../services/common/updateProgrammingLanguageService"));
const programmingLanguagesMessages_1 = require("../../constants/common/programmingLanguagesMessages");
const updateProgrammingLanguage = async (req, res) => {
    try {
        const { id, languageName } = req.body;
        const result = await updateProgrammingLanguageService_1.default.updateProgrammingLanguage(id, languageName);
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.OK).json({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_SUCCESS_MESSAGE, result });
    }
    catch (error) {
        console.error(`Error while updating programming language: ${error}`);
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_ERROR_MESSAGE });
    }
};
exports.default = { updateProgrammingLanguage };
