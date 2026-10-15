import { Request, Response } from 'express';
import deleteProgrammingLanguageController from '../../../controllers/common/deleteProgrammingLanguageController';
import deleteProgrammingLanguageService from '../../../services/common/deleteProgrammingLanguageService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../../constants/common/programmingLanguagesMessages';

jest.mock('../../../services/common/deleteProgrammingLanguageService', () => ({
    __esModule: true,
    default: { deleteProgrammingLanguage: jest.fn() }
}));

const deleteProgrammingLanguageMock = deleteProgrammingLanguageService.deleteProgrammingLanguage as unknown as jest.Mock;

describe('deleteProgrammingLanguageController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteProgrammingLanguageMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with success message when the programming language is deleted', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } } as unknown as Request;
        const deletedLanguage = { _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' };
        deleteProgrammingLanguageMock.mockResolvedValue(deletedLanguage);

        await deleteProgrammingLanguageController.deleteProgrammingLanguage(req, res);

        expect(deleteProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_SUCCESS_MESSAGE, data: deletedLanguage });
    });

    it('returns 404 when the programming language is not found', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } } as unknown as Request;
        deleteProgrammingLanguageMock.mockResolvedValue(null);

        await deleteProgrammingLanguageController.deleteProgrammingLanguage(req, res);

        expect(deleteProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_NOT_FOUND_MESSAGE });
    });

    it('returns 500 with error message when the service throws', async () => {
        const req = { params: { id: '65f1a2b3c4d5e6f7890abcd1' } } as unknown as Request;
        deleteProgrammingLanguageMock.mockRejectedValue(new Error('Service failure'));

        await deleteProgrammingLanguageController.deleteProgrammingLanguage(req, res);

        expect(deleteProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_ERROR_MESSAGE });
    });
});