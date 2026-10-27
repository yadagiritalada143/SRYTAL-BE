"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addProgrammingLanguageService_1 = __importDefault(require("../../services/common/addProgrammingLanguageService"));
const programmingLanguagesMessages_1 = require("../../constants/common/programmingLanguagesMessages");
const addProgrammingLanguage = async (req, res) => {
    try {
        const { languageName, canonicalKey, wandboxLabel, isActive, isExecutable, displayOrder } = req.body;
        await addProgrammingLanguageService_1.default.addProgrammingLanguage(languageName, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (canonicalKey ? { canonicalKey } : {})), (wandboxLabel ? { wandboxLabel } : {})), (isActive !== undefined ? { isActive } : {})), (isExecutable !== undefined ? { isExecutable } : {})), (displayOrder !== undefined ? { displayOrder } : {})));
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.OK).json({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_ADD_SUCCESS_MESSAGE });
    }
    catch (error) {
        console.error(`Error while adding programming language: ${error}`);
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_ADD_ERROR_MESSAGE });
    }
};
exports.default = { addProgrammingLanguage };
