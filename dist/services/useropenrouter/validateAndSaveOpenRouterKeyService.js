"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const userOpenRouterKeyModel_1 = __importDefault(require("../../model/userOpenRouterKeyModel"));
const validateAndSaveOpenRouterKeyService = async (userId, openrouterKey) => {
    var _a, _b, _c;
    try {
        if (!userId) {
            throw new Error('USER_ID_REQUIRED');
        }
        if (!(openrouterKey === null || openrouterKey === void 0 ? void 0 : openrouterKey.trim())) {
            throw new Error('OPENROUTER_KEY_REQUIRED');
        }
        /**
         * Verify that the logged-in user exists.
         */
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }
        /**
         * Validate the OpenRouter key before saving it.
         */
        const response = await axios_1.default.get('https://openrouter.ai/api/v1/key', {
            headers: {
                Authorization: `Bearer ${openrouterKey.trim()}`,
            },
            timeout: 10000,
        });
        if (response.status !== 200 ||
            !response.data) {
            throw new Error('INVALID_OPENROUTER_KEY');
        }
        /**
         * Create the key if the user does not have one.
         *
         * Otherwise replace the existing key.
         */
        const savedKey = await userOpenRouterKeyModel_1.default.findOneAndUpdate({ userId }, {
            $set: {
                openrouterKey: openrouterKey.trim(),
                updatedAt: new Date(),
            },
            $setOnInsert: {
                createdAt: new Date(),
            },
        }, {
            upsert: true,
            new: true,
            runValidators: true,
        });
        if (!savedKey) {
            throw new Error('OPENROUTER_KEY_SAVE_FAILED');
        }
        console.log(`OpenRouter key ${savedKey.isNew ? 'created' : 'saved'} successfully for user ${userId}`);
    }
    catch (error) {
        if ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) {
            console.error(`Validate And Save OpenRouter Key Service Error (status ${error.response.status}):`, error.response.data
                ? JSON.stringify(error.response.data)
                : error.message);
        }
        else {
            console.error(`Validate And Save OpenRouter Key Service Error: ${error.message}`);
        }
        /**
         * User validation errors.
         */
        if (error.message ===
            'USER_ID_REQUIRED' ||
            error.message ===
                'OPENROUTER_KEY_REQUIRED' ||
            error.message ===
                'USER_NOT_FOUND') {
            throw error;
        }
        /**
         * OpenRouter rejected the key.
         */
        if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 401 ||
            ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 403) {
            throw new Error('INVALID_OPENROUTER_KEY');
        }
        if (error.message ===
            'INVALID_OPENROUTER_KEY') {
            throw error;
        }
        throw error;
    }
};
exports.default = {
    validateAndSaveOpenRouterKeyService,
};
