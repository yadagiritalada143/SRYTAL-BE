import { Request, Response } from 'express';
import addProgrammingLanguageController from '../../../controllers/common/addProgrammingLanguageController';
import addProgrammingLanguageService from '../../../services/common/addProgrammingLanguageService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../../constants/common/programmingLanguagesMessages';

jest.mock('../../../services/common/addProgrammingLanguageService', () => ({
    __esModule: true,
    default: { addProgrammingLanguage: jest.fn() }
}));

const addProgrammingLanguageMock = addProgrammingLanguageService.addProgrammingLanguage as unknown as jest.Mock;

describe('addProgrammingLanguageController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addProgrammingLanguageMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with success message when the programming language is added', async () => {
        const req = { body: { languageName: 'JavaScript' } } as unknown as Request;
        addProgrammingLanguageMock.mockResolvedValue({ _id: '65f1a2b3c4d5e6f7890abcd1', languageName: 'JavaScript' });

        await addProgrammingLanguageController.addProgrammingLanguage(req, res);

        expect(addProgrammingLanguageMock).toHaveBeenCalledWith('JavaScript');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_ADD_SUCCESS_MESSAGE });
    });

    it('returns 500 with error message when the service throws', async () => {
        const req = { body: { languageName: 'JavaScript' } } as unknown as Request;
        addProgrammingLanguageMock.mockRejectedValue(new Error('Service failure'));

        await addProgrammingLanguageController.addProgrammingLanguage(req, res);

        expect(addProgrammingLanguageMock).toHaveBeenCalledWith('JavaScript');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_ADD_ERROR_MESSAGE });
    });
});