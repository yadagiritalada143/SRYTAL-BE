"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProfileImageService_1 = __importDefault(require("../../services/common/getProfileImageService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const manageProfileImages_1 = __importDefault(require("../../util/manageProfileImages"));
const awsS3Config_1 = require("../../config/awsS3Config");
const getProfileImage = (req, res) => {
    const { userId } = req.body;
    getProfileImageService_1.default
        .getProfileImage(userId)
        .then((responseAftergetProfileImage) => {
        if (!!responseAftergetProfileImage && responseAftergetProfileImage.success) {
            return responseAftergetProfileImage.imagePath;
        }
        else {
            throw new Error('Error while fetching Profile Image Details !');
        }
    })
        .then((profileImagePath) => {
        // Get Profile Image from AWS S3 bucket 
        manageProfileImages_1.default
            .getProfileImageFromS3(profileImagePath, awsS3Config_1.profileImagesFolder)
            .then((responseFromS3) => {
            res.setHeader('Content-Type', responseFromS3.imageDetails.contentType);
            res.status(200).send(responseFromS3.imageDetails.body);
        }).catch((error) => {
            console.error(`Error from S3 while fetching profile image is: ${error}`);
            res.status(401).json(error);
        });
    })
        .catch((error) => {
        console.error(`Error occured while fetching the Profile Image: ${error}`);
        res.status(500).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR });
    });
};
exports.default = { getProfileImage };
