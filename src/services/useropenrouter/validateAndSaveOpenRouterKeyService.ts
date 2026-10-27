import axios from 'axios';

import UserModel from '../../model/userModel';
import UserOpenRouterKey from '../../model/userOpenRouterKeyModel';

const validateAndSaveOpenRouterKeyService = async (
    userId: string,
    openrouterKey: string
): Promise<void> => {
    try {
        if (!userId) {
            throw new Error('USER_ID_REQUIRED');
        }

        if (!openrouterKey?.trim()) {
            throw new Error('OPENROUTER_KEY_REQUIRED');
        }

        /**
         * Verify that the logged-in user exists.
         */
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        /**
         * Validate the OpenRouter key before saving it.
         */
        const response = await axios.get(
            'https://openrouter.ai/api/v1/key',
            {
                headers: {
                    Authorization: `Bearer ${openrouterKey.trim()}`,
                },
                timeout: 10000,
            }
        );

        if (
            response.status !== 200 ||
            !response.data
        ) {
            throw new Error(
                'INVALID_OPENROUTER_KEY'
            );
        }

        /**
         * Create the key if the user does not have one.
         *
         * Otherwise replace the existing key.
         */
        const savedKey =
            await UserOpenRouterKey.findOneAndUpdate(
                { userId },

                {
                    $set: {
                        openrouterKey:
                            openrouterKey.trim(),
                        updatedAt: new Date(),
                    },

                    $setOnInsert: {
                        createdAt: new Date(),
                    },
                },

                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                }
            );

        if (!savedKey) {
            throw new Error(
                'OPENROUTER_KEY_SAVE_FAILED'
            );
        }

        console.log(
            `OpenRouter key ${savedKey.isNew ? 'created' : 'saved'} successfully for user ${userId}`
        );
    } catch (error: any) {
        if (error.response?.status) {
            console.error(
                `Validate And Save OpenRouter Key Service Error (status ${error.response.status}):`,
                error.response.data
                    ? JSON.stringify(
                          error.response.data
                      )
                    : error.message
            );
        } else {
            console.error(
                `Validate And Save OpenRouter Key Service Error: ${error.message}`
            );
        }

        /**
         * User validation errors.
         */
        if (
            error.message ===
                'USER_ID_REQUIRED' ||
            error.message ===
                'OPENROUTER_KEY_REQUIRED' ||
            error.message ===
                'USER_NOT_FOUND'
        ) {
            throw error;
        }

        /**
         * OpenRouter rejected the key.
         */
        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {
            throw new Error(
                'INVALID_OPENROUTER_KEY'
            );
        }

        if (
            error.message ===
            'INVALID_OPENROUTER_KEY'
        ) {
            throw error;
        }

        throw error;
    }
};

export default {
    validateAndSaveOpenRouterKeyService,
};