"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProgrammingLanguageByIdService_1 = __importDefault(require("../../services/common/getProgrammingLanguageByIdService"));
const programmingLanguagesMessages_1 = require("../../constants/common/programmingLanguagesMessages");
const getProgrammingLanguageById = async (req, res) => {
    try {
        const { id } = req.params;
        const programmingLanguage = await getProgrammingLanguageByIdService_1.default.getProgrammingLanguageById(id);
        if (!programmingLanguage) {
            return res.status(programmingLanguagesMessages_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_NOT_FOUND_MESSAGE });
        }
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.OK).json({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_SUCCESS_MESSAGE, data: programmingLanguage });
    }
    catch (error) {
        console.error(`Error while fetching programming language by id: ${error}`);
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_ERROR_MESSAGE });
    }
};
exports.default = { getProgrammingLanguageById };
