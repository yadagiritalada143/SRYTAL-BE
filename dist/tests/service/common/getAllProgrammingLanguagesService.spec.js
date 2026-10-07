"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllProgrammingLanguagesService_1 = __importDefault(require("../../../services/common/getAllProgrammingLanguagesService"));
const programmingLanguagesModel_1 = __importDefault(require("../../../model/programmingLanguagesModel"));
jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = programmingLanguagesModel_1.default.find;
describe('getAllProgrammingLanguagesService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns all programming languages', async () => {
        const programmingLanguages = [
            { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' },
            { _id: '65f1a2b3c4d5e6f7890abcd2', languageName: 'TypeScript' }
        ];
        findMock.mockResolvedValue(programmingLanguages);
        const result = await getAllProgrammingLanguagesService_1.default.getAllProgrammingLanguages();
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
        expect(result).toEqual(programmingLanguages);
    });
    it('throws an error when the query fails', async () => {
        findMock.mockRejectedValue(new Error('Database failure'));
        await expect(getAllProgrammingLanguagesService_1.default.getAllProgrammingLanguages()).rejects.toThrow('Database failure');
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
});
