import { Request, Response } from 'express';
import getAllProgrammingLanguagesController from '../../../controllers/common/getAllProgrammingLanguagesController';
import getAllProgrammingLanguagesService from '../../../services/common/getAllProgrammingLanguagesService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../../constants/common/programmingLanguagesMessages';

jest.mock('../../../services/common/getAllProgrammingLanguagesService', () => ({
    __esModule: true,
    default: { getAllProgrammingLanguages: jest.fn() }
}));

const getAllProgrammingLanguagesMock = getAllProgrammingLanguagesService.getAllProgrammingLanguages as unknown as jest.Mock;

describe('getAllProgrammingLanguagesController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllProgrammingLanguagesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the programming languages when fetched successfully', async () => {
        const req = {} as unknown as Request;
        const programmingLanguages = [
            { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' },
            { _id: '65f1a2b3c4d5e6f7890abcd2', languageName: 'TypeScript' }
        ];
        getAllProgrammingLanguagesMock.mockResolvedValue(programmingLanguages);

        await getAllProgrammingLanguagesController.getAllProgrammingLanguages(req, res);

        expect(getAllProgrammingLanguagesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_SUCCESS_MESSAGE, data: programmingLanguages });
    });

    it('returns 500 with error message when the service throws', async () => {
        const req = {} as unknown as Request;
        getAllProgrammingLanguagesMock.mockRejectedValue(new Error('Service failure'));

        await getAllProgrammingLanguagesController.getAllProgrammingLanguages(req, res);

        expect(getAllProgrammingLanguagesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_ERROR_MESSAGE });
    });
});