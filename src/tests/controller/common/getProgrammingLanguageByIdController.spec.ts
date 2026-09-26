import { Request, Response } from 'express';
import getProgrammingLanguageByIdController from '../../../controllers/common/getProgrammingLanguageByIdController';
import getProgrammingLanguageByIdService from '../../../services/common/getProgrammingLanguageByIdService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../../constants/common/programmingLanguagesMessages';

jest.mock('../../../services/common/getProgrammingLanguageByIdService', () => ({
    __esModule: true,
    default: { getProgrammingLanguageById: jest.fn() }
}));

const getProgrammingLanguageByIdMock = getProgrammingLanguageByIdService.getProgrammingLanguageById as unknown as jest.Mock;

describe('getProgrammingLanguageByIdController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getProgrammingLanguageByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the programming language when found', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } } as unknown as Request;
        const programmingLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        getProgrammingLanguageByIdMock.mockResolvedValue(programmingLanguage);

        await getProgrammingLanguageByIdController.getProgrammingLanguageById(req, res);

        expect(getProgrammingLanguageByIdMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_SUCCESS_MESSAGE, data: programmingLanguage });
    });

    it('returns 404 when the programming language is not found', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } } as unknown as Request;
        getProgrammingLanguageByIdMock.mockResolvedValue(null);

        await getProgrammingLanguageByIdController.getProgrammingLanguageById(req, res);

        expect(getProgrammingLanguageByIdMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_NOT_FOUND_MESSAGE });
    });

    it('returns 500 with error message when the service throws', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } } as unknown as Request;
        getProgrammingLanguageByIdMock.mockRejectedValue(new Error('Service failure'));

        await getProgrammingLanguageByIdController.getProgrammingLanguageById(req, res);

        expect(getProgrammingLanguageByIdMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_ERROR_MESSAGE });
    });
});