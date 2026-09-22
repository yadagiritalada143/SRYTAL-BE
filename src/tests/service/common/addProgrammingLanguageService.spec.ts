import addProgrammingLanguageService from '../../../services/common/addProgrammingLanguageService';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';

jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: jest.fn()
}));

const ProgrammingLanguagesMock = ProgrammingLanguages as unknown as jest.Mock;

describe('addProgrammingLanguageService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        ProgrammingLanguagesMock.mockReset();
        saveSpy = jest.fn();
        ProgrammingLanguagesMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('saves the programming language and returns the saved document', async () => {
        const savedLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        saveSpy.mockResolvedValue(savedLanguage);

        const result = await addProgrammingLanguageService.addProgrammingLanguage('JavaScript');

        expect(ProgrammingLanguagesMock).toHaveBeenCalledTimes(1);
        expect(ProgrammingLanguagesMock).toHaveBeenCalledWith({ languageName: 'JavaScript' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedLanguage);
    });

    it('throws an error when saving fails', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));

        await expect(addProgrammingLanguageService.addProgrammingLanguage('JavaScript')).rejects.toThrow('An error occurred while adding programming language.');

        expect(ProgrammingLanguagesMock).toHaveBeenCalledTimes(1);
        expect(ProgrammingLanguagesMock).toHaveBeenCalledWith({ languageName: 'JavaScript' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});