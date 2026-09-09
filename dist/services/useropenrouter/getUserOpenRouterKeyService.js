"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const userOpenRouterKeyModel_1 = __importDefault(require("../../model/userOpenRouterKeyModel"));
const getUserOpenRouterKeyService = async (userId) => {
    try {
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }
        const userOpenRouterKey = await userOpenRouterKeyModel_1.default.findOne({ userId });
        if (!userOpenRouterKey) {
            throw new Error('USER_OPENROUTER_KEY_NOT_FOUND');
        }
        return userOpenRouterKey;
    }
    catch (error) {
        console.error(`User OpenRouter Key Service Error: ${error.message}`);
        throw error;
    }
};
exports.default = { getUserOpenRouterKeyService };
