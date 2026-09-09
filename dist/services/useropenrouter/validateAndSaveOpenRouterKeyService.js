"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const userOpenRouterKeyModel_1 = __importDefault(require("../../model/userOpenRouterKeyModel"));
const validateAndSaveOpenRouterKeyService = async (userId, openrouterKey) => {
    var _a;
    try {
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }
        const response = await axios_1.default.get('https://openrouter.ai/api/v1/key', {
            headers: {
                Authorization: `Bearer ${openrouterKey}`,
            },
            timeout: 10000,
        });
        if (response.status !== 200 || !response.data) {
            throw new Error('INVALID_OPENROUTER_KEY');
        }
        await userOpenRouterKeyModel_1.default.findOneAndUpdate({ userId }, { $set: { openrouterKey, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true, new: true, runValidators: true });
    }
    catch (error) {
        if ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) {
            console.error(`Validate And Save OpenRouter Key Service Error (status ${error.response.status}): ${error.response.data ? JSON.stringify(error.response.data) : error.message}`);
        }
        else {
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
exports.default = { validateAndSaveOpenRouterKeyService };
