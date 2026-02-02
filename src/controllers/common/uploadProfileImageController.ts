import { Request, Response } from 'express';
import uploadImageToS3Utility from '../../util/manageProfileImages';
import uploadProfileImageService from '../../services/common/uploadProfileImageService';
import { EMPLOYEE_ERRORS } from '../../constants/commonErrorMessages';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { profileImagesFolder } from '../../config/awsS3Config';

const uploadProfileImage = async (req: Request, res: Response) => {
    try {

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { originalname, buffer, mimetype } = req.file;
        const uniqueName = uuidv4() + path.extname(originalname);

        // Upload Profile Image to AWS S3 bucket
        uploadImageToS3Utility.uploadImageToS3(uniqueName, buffer, mimetype, profileImagesFolder)
            .then((responseAfterProfileImageUpload: any) => {
                if (responseAfterProfileImageUpload.Location) {
                    const { userId } = req.body;
                    uploadProfileImageService
                        .updateProfileImageDetails(uniqueName, userId)
                        .then((responseAfterProfileImageUploaded: any) => {
                            if (!!responseAfterProfileImageUploaded && responseAfterProfileImageUploaded.success) {
                                res.status(200).json(responseAfterProfileImageUploaded);
                            } else {
                                res.status(401).json(responseAfterProfileImageUploaded);
                            }
                        })
                        .catch((error: any) => {
                            console.error(`Error occured while updating the Profile Image: ${error}`);
                            res.status(500).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
                        });
                } else {
                    res.status(500).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
                }
            })
            .catch((error: any) => {
                console.error(`Error occured while Profile Image upload: ${error}`);
                res.status(500).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
            })
    } catch (error: any) {
        console.error(`Error occured while updating the Profile Image to S3: ${error}`);
        res.status(500).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR });
    }
}

export default { uploadProfileImage }
