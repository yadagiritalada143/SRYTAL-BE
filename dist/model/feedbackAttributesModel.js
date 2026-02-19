"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const FeedbackAttributesSchema = new mongoose_1.default.Schema({
    name: { type: mongoose_1.default.Schema.Types.String, required: true },
}, {
    collection: 'feedback-attributes',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
FeedbackAttributesSchema.plugin(mongoose_unique_validator_1.default);
const FeedbackAttributesModel = mongoose_1.default.model('FeedbackAttributesModel', FeedbackAttributesSchema);
exports.default = FeedbackAttributesModel;
