"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const VisitorsCountSchema = new mongoose_1.default.Schema({
    visitorCount: { type: mongoose_1.default.Schema.Types.Number },
    lastUpdatedAt: { type: mongoose_1.default.Schema.Types.Date }
}, {
    collection: 'visitors-count',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
VisitorsCountSchema.plugin(mongoose_unique_validator_1.default);
VisitorsCountSchema.virtual('id').get(function () {
    return String(this._id);
});
const VisitorsCountModel = mongoose_1.default.model('VisitorsCountSchema', VisitorsCountSchema);
exports.default = VisitorsCountModel;
