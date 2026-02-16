"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgotPasswordService_1 = __importDefault(require("../../services/common/forgotPasswordService"));
const forgotPassword = (req, res) => {
    const { username } = req.body;
    forgotPasswordService_1.default.forgotPassword(username)
        .then((responseAfterforgotPassword) => {
        if (!!responseAfterforgotPassword && responseAfterforgotPassword.success) {
            res.status(200).json(responseAfterforgotPassword);
        }
        else {
            res.status(401).json(responseAfterforgotPassword);
        }
    })
        .catch((error) => {
        console.error(`Error occured in forgot password flow: ${error}`);
        res.status(500).json({ success: false, message: 'Error occured in forgot password flow !' });
    });
};
exports.default = { forgotPassword };
