import { Request, Response } from 'express';
import getProfileImageService from '../../services/common/getProfileImageService';
import { EMPLOYEE_ERRORS } from '../../constants/commonErrorMessages';
import getImageFromS3Utility from '../../util/manageProfileImages';
import { profileImagesFolder } from '../../config/awsS3Config';

const getProfileImage = (req: Request, res: Response) => {
    const { userId } = req.body;

    getProfileImageService
        .getProfileImage(userId)
        .then((responseAftergetProfileImage: any) => {
            if (!!responseAftergetProfileImage && responseAftergetProfileImage.success) {
                return responseAftergetProfileImage.imagePath;
            } else {
                throw new Error('Error while fetching Profile Image Details !');
            }
        })
        .then((profileImagePath: string) => {

            // Get Profile Image from AWS S3 bucket 
            getImageFromS3Utility
                .getProfileImageFromS3(profileImagePath, profileImagesFolder)
                .then((responseFromS3: any) => {
                    res.setHeader('Content-Type', responseFromS3.imageDetails.contentType);
                    res.status(200).send(responseFromS3.imageDetails.body);
                }).catch((error: any) => {
                    console.error(`Error from S3 while fetching profile image is: ${error}`);
                    res.status(401).json(error);
                });
        })
        .catch((error: any) => {
            console.error(`Error occured while fetching the Profile Image: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR });
        });
}

export default { getProfileImage }
