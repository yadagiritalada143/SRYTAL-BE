import getProgrammingLanguageByIdService from '../../../services/common/getProgrammingLanguageByIdService';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';

jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const findByIdMock = (ProgrammingLanguages as unknown as { findById: jest.Mock }).findById;

describe('getProgrammingLanguageByIdService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the programming language when found', async () => {
        const programmingLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        findByIdMock.mockResolvedValue(programmingLanguage);

        const result = await getProgrammingLanguageByIdService.getProgrammingLanguageById('65f1a2b3c4d5e6f7890abcd1');

        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
        expect(result).toEqual(programmingLanguage);
    });

    it('returns null when the programming language is not found', async () => {
        findByIdMock.mockResolvedValue(null);

        const result = await getProgrammingLanguageByIdService.getProgrammingLanguageById('65f1a2b3c4d5e6f7890abcd1');

        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
        expect(result).toBeNull();
    });

    it('throws an error when the query fails', async () => {
        findByIdMock.mockRejectedValue(new Error('Database failure'));

        await expect(getProgrammingLanguageByIdService.getProgrammingLanguageById('65f1a2b3c4d5e6f7890abcd1')).rejects.toThrow('Database failure');

        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith({ _id: '65f1a2b3c4d5e6f7890abcd1' });
    });
});