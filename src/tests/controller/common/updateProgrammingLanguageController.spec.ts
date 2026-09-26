import { Request, Response } from 'express';
import updateProgrammingLanguageController from '../../../controllers/common/updateProgrammingLanguageController';
import updateProgrammingLanguageService from '../../../services/common/updateProgrammingLanguageService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../../constants/common/programmingLanguagesMessages';

jest.mock('../../../services/common/updateProgrammingLanguageService', () => ({
    __esModule: true,
    default: { updateProgrammingLanguage: jest.fn() }
}));

const updateProgrammingLanguageMock = updateProgrammingLanguageService.updateProgrammingLanguage as unknown as jest.Mock;

describe('updateProgrammingLanguageController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateProgrammingLanguageMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with success message and update result when the programming language is updated', async () => {
        const req = { body: { id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'TypeScript' } } as unknown as Request;
        const updateResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
        updateProgrammingLanguageMock.mockResolvedValue(updateResult);

        await updateProgrammingLanguageController.updateProgrammingLanguage(req, res);

        expect(updateProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1', 'TypeScript');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_SUCCESS_MESSAGE, result: updateResult });
    });

    it('returns 500 with error message when the service throws', async () => {
        const req = { body: { id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'TypeScript' } } as unknown as Request;
        updateProgrammingLanguageMock.mockRejectedValue(new Error('Service failure'));

        await updateProgrammingLanguageController.updateProgrammingLanguage(req, res);

        expect(updateProgrammingLanguageMock).toHaveBeenCalledWith('65f1a2b3c4d5e6f7890abcd1', 'TypeScript');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_ERROR_MESSAGE });
    });
});