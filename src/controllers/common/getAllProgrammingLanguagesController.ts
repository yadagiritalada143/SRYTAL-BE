import { Request, Response } from 'express';
import getAllProgrammingLanguagesService from '../../services/common/getAllProgrammingLanguagesService';
import { PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES, PROGRAMMING_LANGUAGES_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/common/programmingLanguagesMessages';

const getAllProgrammingLanguages = async (req: Request, res: Response): Promise<Response> => {
    try {
        const programmingLanguages = await getAllProgrammingLanguagesService.getAllProgrammingLanguages();
        return res.status(HTTP_STATUS.OK).json({ success: true, message: PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_SUCCESS_MESSAGE, data: programmingLanguages });

    } catch (error: any) {
        console.error(`Error while fetching programming languages: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: PROGRAMMING_LANGUAGES_ERROR_MESSAGES.FETCH_ALL_PROGRAMMING_LANGUAGES_ERROR_MESSAGE });
    }
}

export default { getAllProgrammingLanguages };
