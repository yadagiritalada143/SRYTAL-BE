import UserModel from '../../model/userModel';
import UserOpenRouterKey from '../../model/userOpenRouterKeyModel';
import { IUserOpenRouterKey } from '../../interfaces/userOpenRouterKeyInterface';
const getUserOpenRouterKeyService = async (userId: string): Promise<IUserOpenRouterKey | null> => {
    try {

        const user = await UserModel.findById(userId);

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        const userOpenRouterKey = await UserOpenRouterKey.findOne({ userId });

        if (!userOpenRouterKey) {
            throw new Error('USER_OPENROUTER_KEY_NOT_FOUND');
        }

        return userOpenRouterKey;

    } catch (error: any) {
        console.error(`User OpenRouter Key Service Error: ${error.message}`);
        throw error;
    }
  
};

export default { getUserOpenRouterKeyService };
