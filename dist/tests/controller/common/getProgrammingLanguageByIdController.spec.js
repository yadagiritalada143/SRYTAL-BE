"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProgrammingLanguageByIdController_1 = __importDefault(require("../../../controllers/common/getProgrammingLanguageByIdController"));
const getProgrammingLanguageByIdService_1 = __importDefault(require("../../../services/common/getProgrammingLanguageByIdService"));
const programmingLanguagesMessages_1 = require("../../../constants/common/programmingLanguagesMessages");
jest.mock('../../../services/common/getProgrammingLanguageByIdService', () => ({
    __esModule: true,
    default: { getProgrammingLanguageById: jest.fn() }
}));
const getProgrammingLanguageByIdMock = getProgrammingLanguageByIdService_1.default.getProgrammingLanguageById;
describe('getProgrammingLanguageByIdController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getProgrammingLanguageByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the programming language when found', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } };
        const programmingLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        getProgrammingLanguageByIdMock.mockResolvedValue(programmingLanguage);
        await getProgrammingLanguageByIdController_1.default.getProgrammingLanguageById(req, res);
        expect(getProgrammingLanguageByIdMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_SUCCESS_MESSAGE, data: programmingLanguage });
    });
    it('returns 404 when the programming language is not found', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } };
        getProgrammingLanguageByIdMock.mockResolvedValue(null);
        await getProgrammingLanguageByIdController_1.default.getProgrammingLanguageById(req, res);
        expect(getProgrammingLanguageByIdMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_NOT_FOUND_MESSAGE });
    });
    it('returns 500 with error message when the service throws', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } };
        getProgrammingLanguageByIdMock.mockRejectedValue(new Error('Service failure'));
        await getProgrammingLanguageByIdController_1.default.getProgrammingLanguageById(req, res);
        expect(getProgrammingLanguageByIdMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(programmingLanguagesMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: programmingLanguagesMessages_1.PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_ERROR_MESSAGE });
    });
});
