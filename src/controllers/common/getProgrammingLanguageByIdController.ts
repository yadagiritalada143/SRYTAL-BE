import { Request, Response } from 'express';
import getProgrammingLanguageByIdService from '../../services/common/getProgrammingLanguageByIdService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/common/programmingLanguagesMessages';

const getProgrammingLanguageById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const programmingLanguage = await getProgrammingLanguageByIdService.getProgrammingLanguageById(id);

        if (!programmingLanguage) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_NOT_FOUND_MESSAGE });
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_SUCCESS_MESSAGE, data: programmingLanguage });

    } catch (error: any) {
        console.error(`Error while fetching programming language by id: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_PROGRAMMING_LANGUAGE_BY_ID_ERROR_MESSAGE });
    }
}

export default { getProgrammingLanguageById };
