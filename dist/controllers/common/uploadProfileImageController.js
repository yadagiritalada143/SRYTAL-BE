"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manageProfileImages_1 = __importDefault(require("../../util/manageProfileImages"));
const uploadProfileImageService_1 = __importDefault(require("../../services/common/uploadProfileImageService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const awsS3Config_1 = require("../../config/awsS3Config");
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const { originalname, buffer, mimetype } = req.file;
        const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
        // Upload Profile Image to AWS S3 bucket
        manageProfileImages_1.default.uploadImageToS3(uniqueName, buffer, mimetype, awsS3Config_1.profileImagesFolder)
            .then((responseAfterProfileImageUpload) => {
            if (responseAfterProfileImageUpload.Location) {
                const { userId } = req.body;
                uploadProfileImageService_1.default
                    .updateProfileImageDetails(uniqueName, userId)
                    .then((responseAfterProfileImageUploaded) => {
                    if (!!responseAfterProfileImageUploaded && responseAfterProfileImageUploaded.success) {
                        res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(responseAfterProfileImageUploaded);
                    }
                    else {
                        res.status(commonErrorMessages_1.HTTP_STATUS.UNAUTHORIZED).json(responseAfterProfileImageUploaded);
                    }
                })
                    .catch((error) => {
                    console.error(`Error occured while updating the Profile Image: ${error}`);
                    res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
                });
            }
            else {
                res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
            }
        })
            .catch((error) => {
            console.error(`Error occured while Profile Image upload: ${error}`);
            res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
        });
    }
    catch (error) {
        console.error(`Error occured while updating the Profile Image to S3: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
    }
};
exports.default = { uploadProfileImage };
