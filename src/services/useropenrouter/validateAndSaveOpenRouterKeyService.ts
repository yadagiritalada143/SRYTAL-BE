import axios from 'axios';
import UserModel from '../../model/userModel';
import UserOpenRouterKey from '../../model/userOpenRouterKeyModel';

const validateAndSaveOpenRouterKeyService = async (userId: string, openrouterKey: string): Promise<void> => {
    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        const response = await axios.get('https://openrouter.ai/api/v1/key', {
            headers: {
                Authorization: `Bearer ${openrouterKey}`,
            },
            timeout: 10000,
        });

        if (response.status !== 200 || !response.data) {
            throw new Error('INVALID_OPENROUTER_KEY');
        }

        await UserOpenRouterKey.findOneAndUpdate(
            { userId },
            { $set: { openrouterKey, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
            { upsert: true, new: true, runValidators: true }
        );

    } catch (error: any) {
        if (error.response?.status) {
            console.error(`Validate And Save OpenRouter Key Service Error (status ${error.response.status}): ${error.response.data ? JSON.stringify(error.response.data) : error.message}`);
        } else {
            console.error(`Validate And Save OpenRouter Key Service Error: ${error.message}`);
        }

        if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_OPENROUTER_KEY') {
            throw error;
        }

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            throw new Error('INVALID_OPENROUTER_KEY');
        }

        throw error;
    }
};

export default { validateAndSaveOpenRouterKeyService };
