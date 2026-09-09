"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateAppWalkThroughService_1 = __importDefault(require("../../services/common/updateAppWalkThroughService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const updateApplicationWalkThrough = (req, res) => {
    updateAppWalkThroughService_1.default
        .updateAppWalkThrough(req.body)
        .then((responseAfterUpdate) => {
        res.status(200).json({ success: true });
    })
        .catch((error) => {
        console.error(`Error occured in Controller layer: ${error}`);
        res.status(401).json({ success: false, message: commonErrorMessages_1.APPLICATION_WALK_THROUGH_ERROR_MESSAGE.UPDATE_APP_WALK_THROUGH_ERROR });
    });
};
exports.default = { updateApplicationWalkThrough };
