"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
// Master catalog of navigable menu items (the app's real pages). Global/app-wide
// and seeded; admins grant these per role/user rather than inventing free URLs.
const NavItemSchema = new mongoose_1.default.Schema({
    key: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    label: { type: mongoose_1.default.Schema.Types.String, required: true },
    url: { type: mongoose_1.default.Schema.Types.String },
    icon: { type: mongoose_1.default.Schema.Types.String, default: 'IconCircle' },
    surface: { type: mongoose_1.default.Schema.Types.String, required: true },
    parentKey: { type: mongoose_1.default.Schema.Types.String, default: null },
    order: { type: mongoose_1.default.Schema.Types.Number, default: 0 },
    isSystem: { type: mongoose_1.default.Schema.Types.Boolean, default: false }
}, {
    collection: 'nav-items',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
NavItemSchema.plugin(mongoose_unique_validator_1.default);
const NavItemModel = mongoose_1.default.model('NavItemModel', NavItemSchema);
exports.default = NavItemModel;
