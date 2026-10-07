"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const ProgrammingLanguagesSchema = new mongoose_1.default.Schema({
    languageName: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
}, {
    collection: 'programming-languages',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
ProgrammingLanguagesSchema.plugin(mongoose_unique_validator_1.default);
const ProgrammingLanguages = mongoose_1.default.model('ProgrammingLanguagesSchema', ProgrammingLanguagesSchema);
exports.default = ProgrammingLanguages;
