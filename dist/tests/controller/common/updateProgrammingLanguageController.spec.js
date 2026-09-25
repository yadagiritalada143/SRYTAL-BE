"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateProgrammingLanguageController_1 = __importDefault(require("../../../controllers/common/updateProgrammingLanguageController"));
const updateProgrammingLanguageService_1 = __importDefault(require("../../../services/common/updateProgrammingLanguageService"));
const programmingLanguagesMessages_1 = require("../../../constants/common/programmingLanguagesMessages");
jest.mock('../../../services/common/updateProgrammingLanguageService', () => ({
    __esModule: true,
    default: { updateProgrammingLanguage: jest.fn() }
}));
const updateProgrammingLanguageMock = updateProgrammingLanguageService_1.default.updateProgrammingLanguage;
describe('updateProgrammingLanguageController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateProgrammingLanguageMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with success message and update result when the programming language is updated', async () => {
        const req = { body: { id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'TypeScript' } };
        const updateResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
        updateProgrammingLanguageMock.mockResolvedValue(updateResult);
        await updateProgrammingLanguageController_1.default.updateProgrammingLanguage(req, res);
        expect(updateProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1', 'TypeScript');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_SUCCESS_MESSAGE, result: updateResult });
    });
    it('returns 500 with error message when the service throws', async () => {
        const req = { body: { id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'TypeScript' } };
        updateProgrammingLanguageMock.mockRejectedValue(new Error('Service failure'));
        await updateProgrammingLanguageController_1.default.updateProgrammingLanguage(req, res);
        expect(updateProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1', 'TypeScript');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_ERROR_MESSAGE });
    });
});
