import express, { Router } from 'express';
import commonController from '../controllers/common/commonController';
import sendContactUsMailController from '../controllers/common/sendContactUsMailController';
import updateApplicationWalkThroughController from '../controllers/common/updateApplicationWalkThroughController';
import updatePasswordController from '../controllers/common/updatePasswordController';
import getOrganizationThemesController from '../controllers/common/getOrganizationThemesController';
import getEmployeeDetailsController from '../controllers/common/getEmployeeDetailsController';
import uploadProfileImageController from '../controllers/common/uploadProfileImageController';
import getProfileImageController from '../controllers/common/getProfileImageController';
import validateJWT from '../middlewares/validateJWT';
import multer from 'multer';
import forgotPasswordController from '../controllers/common/forgotPasswordController';
import employeePackageDetailsByIdController from '../controllers/common/employeePackageDetailsByIdController';
const upload = multer({ storage: multer.memoryStorage() });

const commonRouter: Router = express.Router();

commonRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Successfully server up and running !' });
});

commonRouter.get('/getVisitorCount', commonController.updateVisitorCount);
commonRouter.post('/sendContactUsMail', sendContactUsMailController.sendContactUsMail);
commonRouter.post('/updateApplicationWalkThrough', updateApplicationWalkThroughController.updateApplicationWalkThrough);
commonRouter.post('/updatePassword', validateJWT, updatePasswordController.updatePassword);
commonRouter.get('/getOrganizationThemes/:organization_name', getOrganizationThemesController.getOrganizationThemes);
commonRouter.get('/getEmployeeDetails', validateJWT, getEmployeeDetailsController.getEmployeeDetails);
commonRouter.post('/uploadProfileImage', upload.single('profileImage'), validateJWT, uploadProfileImageController.uploadProfileImage);
commonRouter.get('/getProfileImage', validateJWT, getProfileImageController.getProfileImage);
commonRouter.post('/forgotPassword', forgotPasswordController.forgotPassword);
commonRouter.post('/employeePackageDetailsById', validateJWT, employeePackageDetailsByIdController.employeePackageDetailsByIdController)

export default commonRouter;
