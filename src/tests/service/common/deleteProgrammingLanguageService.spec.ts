import deleteProgrammingLanguageService from '../../../services/common/deleteProgrammingLanguageService';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';

jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));

const findByIdAndDeleteMock = (ProgrammingLanguages as unknown as { findByIdAndDelete: jest.Mock }).findByIdAndDelete;

describe('deleteProgrammingLanguageService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deletes the programming language and returns the deleted document', async () => {
        const deletedLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        findByIdAndDeleteMock.mockResolvedValue(deletedLanguage);

        const result = await deleteProgrammingLanguageService.deleteProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
        expect(result).toEqual(deletedLanguage);
    });

    it('returns null when the programming language is not found', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);

        const result = await deleteProgrammingLanguageService.deleteProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
        expect(result).toBeNull();
    });

    it('throws an error when the delete fails', async () => {
        findByIdAndDeleteMock.mockRejectedValue(new Error('Database failure'));

        await expect(deleteProgrammingLanguageService.deleteProgrammingLanguage('65f1a2b3c4d5e6f7890abcd1')).rejects.toThrow('Database failure');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
    });
});