import { Request, Response } from 'express';
import updateProgrammingLanguageService from '../../services/common/updateProgrammingLanguageService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/common/programmingLanguagesMessages';

const updateProgrammingLanguage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, languageName } = req.body;
        const result = await updateProgrammingLanguageService.updateProgrammingLanguage(id, languageName);
        return res.status(HTTP_STATUS.OK).json({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_SUCCESS_MESSAGE, result });

    } catch (error: any) {
        console.error(`Error while updating programming language: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_UPDATE_ERROR_MESSAGE });
    }
}

export default { updateProgrammingLanguage };