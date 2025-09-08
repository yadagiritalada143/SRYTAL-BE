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
import updateEmployeeTimesheetController from '../controllers/common/updateEmployeeTimesheetController';
const upload = multer({ storage: multer.memoryStorage() });

const commonRouter: Router = express.Router();

commonRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Successfully server up and running !' });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Users login
 *     description: Authenticates a user and returns a JWT access token and refresh token.
 *     tags:
 *       - Login
 *     requestBody:
 *       description: Login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: login Successfully 
 *         headers:
 *           X-CSRF-Token:
 *             description: CSRF token for frontend protection
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                   example: 60f6c0b8b9f1e12d4cd57b2f
 *                 userRole:
 *                   type: string
 *                 passwordResetRequired:
 *                   type: boolean
 *                 applicationWalkThrough:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
commonRouter.post('/login', commonController.login);
commonRouter.get('/getVisitorCount', commonController.updateVisitorCount);
commonRouter.post('/sendContactUsMail', sendContactUsMailController.sendContactUsMail);
commonRouter.post('/updateApplicationWalkThrough', updateApplicationWalkThroughController.updateApplicationWalkThrough);
commonRouter.post('/updatePassword', validateJWT, updatePasswordController.updatePassword);
commonRouter.get('/getOrganizationThemes/:organization_name', getOrganizationThemesController.getOrganizationThemes);
commonRouter.get('/getEmployeeDetails', validateJWT, getEmployeeDetailsController.getEmployeeDetails);
commonRouter.post('/uploadProfileImage', upload.single('profileImage'), validateJWT, uploadProfileImageController.uploadProfileImage);
commonRouter.get('/getProfileImage', validateJWT, getProfileImageController.getProfileImage);
commonRouter.post('/forgotPassword', forgotPasswordController.forgotPassword);
commonRouter.post('/fetchEmployeePackageDetailsById', validateJWT, employeePackageDetailsByIdController.employeePackageDetailsByIdController);
commonRouter.put('/updateEmployeeTimesheet', validateJWT, updateEmployeeTimesheetController.updateEmployeeTimesheetController);

export default commonRouter;
