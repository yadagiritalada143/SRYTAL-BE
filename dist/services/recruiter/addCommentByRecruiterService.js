"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poolCompanies_1 = __importDefault(require("../../model/poolCompanies"));
const addCommentByRecruiter = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, comment, userId }) {
    let result = yield poolCompanies_1.default.findByIdAndUpdate(id, {
        lastUpdatedAt: new Date(),
        $push: {
            comments: {
                comment,
                userId,
                updateAt: new Date()
            }
        }
    }, { new: true });
    if (result && result.id) {
        result = yield poolCompanies_1.default
            .findOne({ _id: id })
            .populate('comments.userId', 'firstName lastName');
    }
    return result;
});
exports.default = { addCommentByRecruiter };
