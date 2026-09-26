"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addProgrammingLanguageController_1 = __importDefault(require("../../../controllers/common/addProgrammingLanguageController"));
const addProgrammingLanguageService_1 = __importDefault(require("../../../services/common/addProgrammingLanguageService"));
const programmingLanguagesMessages_1 = require("../../../constants/common/programmingLanguagesMessages");
jest.mock('../../../services/common/addProgrammingLanguageService', () => ({
    __esModule: true,
    default: { addProgrammingLanguage: jest.fn() }
}));
const addProgrammingLanguageMock = addProgrammingLanguageService_1.default.addProgrammingLanguage;
describe('addProgrammingLanguageController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addProgrammingLanguageMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with success message when the programming language is added', async () => {
        const req = { body: { languageName: 'JavaScript' } };
        addProgrammingLanguageMock.mockResolvedValue({ _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' });
        await addProgrammingLanguageController_1.default.addProgrammingLanguage(req, res);
        expect(addProgrammingLanguageMock).toHaveBeenCalledWith('JavaScript');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_ADD_SUCCESS_MESSAGE });
    });
    it('returns 500 with error message when the service throws', async () => {
        const req = { body: { languageName: 'JavaScript' } };
        addProgrammingLanguageMock.mockRejectedValue(new Error('Service failure'));
        await addProgrammingLanguageController_1.default.addProgrammingLanguage(req, res);
        expect(addProgrammingLanguageMock).toHaveBeenCalledWith('JavaScript');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_ADD_ERROR_MESSAGE });
    });
});
