"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCommentByRecruiterService_1 = __importDefault(require("../../services/recruiter/addCommentByRecruiterService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const addCommentByRecruiter = (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    addCommentByRecruiterService_1.default
        .addCommentByRecruiter(Object.assign(Object.assign({}, req.body), { userId }))
        .then((responseAfterCommentAdded) => {
        if (responseAfterCommentAdded && responseAfterCommentAdded.comments) {
            responseAfterCommentAdded.comments.sort((a, b) => b.updateAt - a.updateAt);
        }
        res.status(200).json({ responseAfterCommentAdded });
    })
        .catch((error) => {
        console.error(`Error in updating profile details: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT });
    });
};
exports.default = { addCommentByRecruiter };
