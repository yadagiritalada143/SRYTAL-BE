import { Request, Response } from 'express';
import { USER_OPENROUTER_KEY_ERROR_MESSAGES, USER_OPENROUTER_KEY_SUCCESS_MESSAGES } from '../../constants/user-router/userOpenRouterKeyMessage';
import validateAndSaveOpenRouterKey from '../../services/useropenrouter/validateAndSaveOpenRouterKeyService';

const validateAndSaveOpenRouterKeyController = async (req: Request, res: Response) => {
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

        if (!openrouterKey || typeof openrouterKey !== 'string' || openrouterKey.trim() === '') {
            res.status(400).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.OPENROUTER_KEY_REQUIRED,
            });

            return;
        }

        await validateAndSaveOpenRouterKey.validateAndSaveOpenRouterKeyService(userId, openrouterKey.trim());

        res.status(200).json({
            success: true,
            message: USER_OPENROUTER_KEY_SUCCESS_MESSAGES.USER_OPENROUTER_KEY_VALIDATED_SUCCESS_MESSAGES,
        });

    } catch (error: any) {
        console.error(`Validate And Save OpenRouter Key Error: ${error.message}`);

        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }

        if (error.message === 'INVALID_OPENROUTER_KEY') {
            res.status(400).json({
                success: false,
                message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_INVALID,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_ADDED_ERROR_MESSAGES,
        });
    }
};

export default { validateAndSaveOpenRouterKeyController };