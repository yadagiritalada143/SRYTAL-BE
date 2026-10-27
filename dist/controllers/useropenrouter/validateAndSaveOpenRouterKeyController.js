"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userOpenRouterKeyMessage_1 = require("../../constants/user-router/userOpenRouterKeyMessage");
const validateAndSaveOpenRouterKeyService_1 = __importDefault(require("../../services/useropenrouter/validateAndSaveOpenRouterKeyService"));
const validateAndSaveOpenRouterKeyController = async (req, res) => {
    var _a;
    try {
        const { openrouterKey } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_ID_REQUIRED,
            });
            return;
        }
        if (!openrouterKey || typeof openrouterKey !== 'string' || openrouterKey.trim() === '') {
            res.status(400).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.OPENROUTER_KEY_REQUIRED,
            });
            return;
        }
        await validateAndSaveOpenRouterKeyService_1.default.validateAndSaveOpenRouterKeyService(userId, openrouterKey.trim());
        res.status(200).json({
            success: true,
            message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_SUCCESS_MESSAGES.USER_OPENROUTER_KEY_VALIDATED_SUCCESS_MESSAGES,
        });
    }
    catch (error) {
        console.error(`Validate And Save OpenRouter Key Error: ${error.message}`);
        if (error.message === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }
        if (error.message === 'INVALID_OPENROUTER_KEY') {
            res.status(400).json({
                success: false,
                message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_INVALID,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: userOpenRouterKeyMessage_1.USER_OPENROUTER_KEY_ERROR_MESSAGES.USER_OPENROUTER_KEY_ADDED_ERROR_MESSAGES,
        });
    }
};
exports.default = { validateAndSaveOpenRouterKeyController };
