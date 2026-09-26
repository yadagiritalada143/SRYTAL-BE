import { Request, Response } from 'express';
import addProgrammingLanguageService from '../../services/common/addProgrammingLanguageService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/common/programmingLanguagesMessages';

const addProgrammingLanguage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { languageName } = req.body;
        await addProgrammingLanguageService.addProgrammingLanguage(languageName);
        return res.status(HTTP_STATUS.OK).json({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_ADD_SUCCESS_MESSAGE });

    } catch (error: any) {
        console.error(`Error while adding programming language: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_ADD_ERROR_MESSAGE });
    }
}

export default { addProgrammingLanguage };
