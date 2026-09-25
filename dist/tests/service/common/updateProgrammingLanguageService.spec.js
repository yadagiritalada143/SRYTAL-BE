"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateProgrammingLanguageService_1 = __importDefault(require("../../../services/common/updateProgrammingLanguageService"));
const programmingLanguagesModel_1 = __importDefault(require("../../../model/programmingLanguagesModel"));
jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = programmingLanguagesModel_1.default.updateOne;
describe('updateProgrammingLanguageService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates the programming language and returns the update result', async () => {
        const updateResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
        updateOneMock.mockResolvedValue(updateResult);
        const result = await updateProgrammingLanguageService_1.default.updateProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1', 'TypeScript');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' }, { languageName: 'TypeScript' });
        expect(result).toEqual(updateResult);
    });
    it('throws an error when the update fails', async () => {
        updateOneMock.mockRejectedValue(new Error('Update failed'));
        await expect(updateProgrammingLanguageService_1.default.updateProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1', 'TypeScript')).rejects.toThrow('An error occurred while updating programming language.');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' }, { languageName: 'TypeScript' });
    });
});
