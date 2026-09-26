"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllProgrammingLanguagesController_1 = __importDefault(require("../../../controllers/common/getAllProgrammingLanguagesController"));
const getAllProgrammingLanguagesService_1 = __importDefault(require("../../../services/common/getAllProgrammingLanguagesService"));
const programmingLanguagesMessages_1 = require("../../../constants/common/programmingLanguagesMessages");
jest.mock('../../../services/common/getAllProgrammingLanguagesService', () => ({
    __esModule: true,
    default: { getAllProgrammingLanguages: jest.fn() }
}));
const getAllProgrammingLanguagesMock = getAllProgrammingLanguagesService_1.default.getAllProgrammingLanguages;
describe('getAllProgrammingLanguagesController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllProgrammingLanguagesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the programming languages when fetched successfully', async () => {
        const req = {};
        const programmingLanguages = [
            { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' },
            { _id: '65f1a2b3c4d5e6f7890abcd2', languageName: 'TypeScript' }
        ];
        getAllProgrammingLanguagesMock.mockResolvedValue(programmingLanguages);
        await getAllProgrammingLanguagesController_1.default.getAllProgrammingLanguages(req, res);
        expect(getAllProgrammingLanguagesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_SUCCESS_MESSAGE, data: programmingLanguages });
    });
    it('returns 500 with error message when the service throws', async () => {
        const req = {};
        getAllProgrammingLanguagesMock.mockRejectedValue(new Error('Service failure'));
        await getAllProgrammingLanguagesController_1.default.getAllProgrammingLanguages(req, res);
        expect(getAllProgrammingLanguagesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_ERROR_MESSAGE });
    });
});
