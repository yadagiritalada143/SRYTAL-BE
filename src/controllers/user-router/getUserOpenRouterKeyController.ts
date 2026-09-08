import { Request, Response } from 'express';
import { USER_OPENROUTER_KEY_ERROR_MESSAGES, USER_OPENROUTER_KEY_SUCCESS_MESSAGES } from '../../constants/common/userOpenRouterKeyConstants';
import UserOpenRouterKey from '../../services/user-router/getUserOpenRouterKeyService';

const getUserOpenRouterKey = async (req: Request, res: Response) => {
    try {

        const userId = req.params.id;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_ID_REQUIRED,
            });

            return;
        }

        const keyDetails = await UserOpenRouterKey.getUserOpenRouterKeyService(userId);

        res.status(200).json({
            success: true,
            message: USER_OPENROUTER_KEY_SUCCESS_MESSAGES.USER_OPENROUTER_KEY_GET_SUCCESS_MESSAGES,
            data: keyDetails
        });

    } catch (error: any) {
        console.error(`User OpenRouter Key Error: ${error.message}`);
        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }

        if (error.message === 'USER_OPENROUTER_KEY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_NOT_FOUND,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_GET_ERROR_MESSAGES,
        });
    }
};

export default { getUserOpenRouterKey };
