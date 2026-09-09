"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userModel_1 = __importDefault(require("../model/userModel"));
const UserOpenRouterKeySchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default, required: true, unique: true },
    openrouterKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    collection: 'user-openrouter-key',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
UserOpenRouterKeySchema.plugin(mongoose_unique_validator_1.default);
const UserOpenRouterKey = mongoose_1.default.model('UserOpenRouterKey', UserOpenRouterKeySchema);
exports.default = UserOpenRouterKey;
