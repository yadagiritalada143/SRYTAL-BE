import getAllProgrammingLanguagesService from '../../../services/common/getAllProgrammingLanguagesService';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';

jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (ProgrammingLanguages as unknown as { find: jest.Mock }).find;

describe('getAllProgrammingLanguagesService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
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

        const result = await getAllProgrammingLanguagesService.getAllProgrammingLanguages();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
        expect(result).toEqual(programmingLanguages);
    });

    it('throws an error when the query fails', async () => {
        findMock.mockRejectedValue(new Error('Database failure'));

        await expect(getAllProgrammingLanguagesService.getAllProgrammingLanguages()).rejects.toThrow('Database failure');

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
});