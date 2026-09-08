import UserModel from '../../model/userModel';
import UserOpenRouterKey from '../../model/userOpenRouterKeyModel';
import { IUserOpenRouterKey } from '../../interfaces/userOpenRouterKeyInterface';

 const userOpenRouterKeyService = async (userId: string, openrouterKey: string): Promise<IUserOpenRouterKey> => {
    try {
        
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        const existingKey = await UserOpenRouterKey.findOne({ userId });

        if (existingKey) {
            throw new Error('USER_OPENROUTER_KEY_EXISTS');
        }

        const userOpenRouterKey = await UserOpenRouterKey.create({ openrouterKey, userId });

        return userOpenRouterKey;

    } catch (error: any) {
        console.error(`User OpenRouter Key Service Error: ${error.message}`);
        throw error;
    }
  
};

export default { userOpenRouterKeyService };
