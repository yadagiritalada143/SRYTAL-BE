import { Request, Response } from 'express';
import { USER_OPENROUTER_KEY_ERROR_MESSAGES, USER_OPENROUTER_KEY_SUCCESS_MESSAGES } from '../../constants/common/userOpenRouterKeyConstants';
import addUserOpenRouterKey from '../../services/user-router/userOpenRouterKeyService';

 const userOpenRouterKey = async (req: Request, res: Response) => {
    try {

        const { openrouterKey } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_ID_REQUIRED,
            });

            return;
        }

        if (!openrouterKey) {
            res.status(400).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.OPENROUTER_KEY_REQUIRED,
            });

            return;
        }

        const addKey = await addUserOpenRouterKey.userOpenRouterKeyService(userId, openrouterKey);

        res.status(201).json({
            success: true,
            message: USER_OPENROUTER_KEY_SUCCESS_MESSAGES.USER_OPENROUTER_KEY_ADDED_SUCCESS_MESSAGES,
            data: addKey
        });

    } catch (error: any) {
        console.error(`Add User OpenRouter Key Error: ${error.message}`);
        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }

        if (error.message === 'USER_OPENROUTER_KEY_EXISTS') {
            res.status(409).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_EXISTS,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_ADDED_ERROR_MESSAGES,
        });
    }
};

export default { userOpenRouterKey };
