"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllProgrammingLanguagesService_1 = __importDefault(require("../../services/common/getAllProgrammingLanguagesService"));
const programmingLanguagesMessages_1 = require("../../constants/common/programmingLanguagesMessages");
const getAllProgrammingLanguages = async (req, res) => {
    try {
        const programmingLanguages = await getAllProgrammingLanguagesService_1.default.getAllProgrammingLanguages();
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.OK).json({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_SUCCESS_MESSAGE, data: programmingLanguages });
    }
    catch (error) {
        console.error(`Error while fetching programming languages: ${error}`);
        return res.status(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_ERROR_MESSAGE });
    }
};
exports.default = { getAllProgrammingLanguages };
