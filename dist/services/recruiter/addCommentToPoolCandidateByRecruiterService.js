"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talentPoolCandidatesModel_1 = __importDefault(require("../../model/talentPoolCandidatesModel"));
const addCommentToPoolCandidateByRecruiter = async ({ id, comment, callStartsAt, callEndsAt, userId }) => {
    let result = await talentPoolCandidatesModel_1.default.findByIdAndUpdate(id, {
        lastUpdatedAt: new Date(),
        $push: {
            comments: {
                comment,
                userId,
                callStartsAt,
                callEndsAt,
                updateAt: new Date()
            }
        }
    }, {
        new: true, populate: {
            path: 'comments.userId',
            select: 'firstName lastName'
        }
    });
    return result;
};
exports.default = { addCommentToPoolCandidateByRecruiter };
