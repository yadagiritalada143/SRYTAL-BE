import { Request, Response } from 'express';
import deleteProgrammingLanguageService from '../../services/common/deleteProgrammingLanguageService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/common/programmingLanguagesMessages';

const deleteProgrammingLanguage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const deletedProgrammingLanguage = await deleteProgrammingLanguageService.deleteProgrammingLanguage(id);

        if (!deletedProgrammingLanguage) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_NOT_FOUND_MESSAGE });
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_SUCCESS_MESSAGE, data: deletedProgrammingLanguage });

    } catch (error: any) {
        console.error(`Error while deleting programming language: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.PROGRAMMING_LANGUAGE_DELETE_ERROR_MESSAGE });
    }
}

export default { deleteProgrammingLanguage };
