"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteProgrammingLanguageController_1 = __importDefault(require("../../../controllers/common/deleteProgrammingLanguageController"));
const deleteProgrammingLanguageService_1 = __importDefault(require("../../../services/common/deleteProgrammingLanguageService"));
const programmingLanguagesMessages_1 = require("../../../constants/common/programmingLanguagesMessages");
jest.mock('../../../services/common/deleteProgrammingLanguageService', () => ({
    __esModule: true,
    default: { deleteProgrammingLanguage: jest.fn() }
}));
const deleteProgrammingLanguageMock = deleteProgrammingLanguageService_1.default.deleteProgrammingLanguage;
describe('deleteProgrammingLanguageController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        deleteProgrammingLanguageMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with success message when the programming language is deleted', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } };
        const deletedLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        deleteProgrammingLanguageMock.mockResolvedValue(deletedLanguage);
        await deleteProgrammingLanguageController_1.default.deleteProgrammingLanguage(req, res);
        expect(deleteProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_SUCCESS_MESSAGE, data: deletedLanguage });
    });
    it('returns 404 when the programming language is not found', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } };
        deleteProgrammingLanguageMock.mockResolvedValue(null);
        await deleteProgrammingLanguageController_1.default.deleteProgrammingLanguage(req, res);
        expect(deleteProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_NOT_FOUND_MESSAGE });
    });
    it('returns 500 with error message when the service throws', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } };
        deleteProgrammingLanguageMock.mockRejectedValue(new Error('Service failure'));
        await deleteProgrammingLanguageController_1.default.deleteProgrammingLanguage(req, res);
        expect(deleteProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_ERROR_MESSAGE });
    });
});
