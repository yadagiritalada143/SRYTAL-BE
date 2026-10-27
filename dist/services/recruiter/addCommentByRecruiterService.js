"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poolCompanies_1 = __importDefault(require("../../model/poolCompanies"));
const addCommentByRecruiter = async ({ id, comment, userId }) => {
    let result = await poolCompanies_1.default.findByIdAndUpdate(id, {
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
        result = await poolCompanies_1.default
            .findOne({ _id: id })
            .populate('comments.userId', 'firstName lastName');
    }
    return result;
};
exports.default = { addCommentByRecruiter };
