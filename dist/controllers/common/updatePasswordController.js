"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePasswordService_1 = __importDefault(require("../../services/common/updatePasswordService"));
const updatePassword = (req, res) => {
    updatePasswordService_1.default.updatePassword(req.body)
        .then((responseAfterPasswordUpdate) => {
        if (!!responseAfterPasswordUpdate && responseAfterPasswordUpdate.success) {
            res.status(200).json(responseAfterPasswordUpdate);
        }
        else {
            res.status(401).json(responseAfterPasswordUpdate);
        }
    })
        .catch((error) => {
        console.log(`Error occured while updating the password: ${error}`);
        res.status(500).json({ success: false, message: 'Error occured while updating the password !' });
    });
};
exports.default = { updatePassword };
