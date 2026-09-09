"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userOpenRouterKeyMessage_1 = require("../../constants/user-router/userOpenRouterKeyMessage");
const getUserOpenRouterKeyService_1 = __importDefault(require("../../services/useropenrouter/getUserOpenRouterKeyService"));
const getUserOpenRouterKey = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_ID_REQUIRED,
            });
            return;
        }
        const keyDetails = await getUserOpenRouterKeyService_1.default.getUserOpenRouterKeyService(userId);
        res.status(200).json({
            success: true,
            message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_SUCCESS_MESSAGES.USER_OPENROUTER_KEY_GET_SUCCESS_MESSAGES,
            data: keyDetails
        });
    }
    catch (error) {
        console.error(`User OpenRouter Key Error: ${error.message}`);
        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }
        if (error.message === 'USER_OPENROUTER_KEY_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_NOT_FOUND,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_GET_ERROR_MESSAGES,
        });
    }
};
exports.default = { getUserOpenRouterKey };
