"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteProgrammingLanguageService_1 = __importDefault(require("../../../services/common/deleteProgrammingLanguageService"));
const programmingLanguagesModel_1 = __importDefault(require("../../../model/programmingLanguagesModel"));
jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));
const findByIdAndDeleteMock = programmingLanguagesModel_1.default.findByIdAndDelete;
describe('deleteProgrammingLanguageService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('deletes the programming language and returns the deleted document', async () => {
        const deletedLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        findByIdAndDeleteMock.mockResolvedValue(deletedLanguage);
        const result = await deleteProgrammingLanguageService_1.default.deleteProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
        expect(result).toEqual(deletedLanguage);
    });
    it('returns null when the programming language is not found', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);
        const result = await deleteProgrammingLanguageService_1.default.deleteProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
        expect(result).toBeNull();
    });
    it('throws an error when the delete fails', async () => {
        findByIdAndDeleteMock.mockRejectedValue(new Error('Database failure'));
        await expect(deleteProgrammingLanguageService_1.default.deleteProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1')).rejects.toThrow('Database failure');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
    });
});
