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
import downloadSalarySlipController from '../controllers/common/downloadSalarySlipController';
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

/**
 * @swagger
 * /downloadSalarySlip:
 *   post:
 *     summary: Download a specific salary slip
 *     description: Returns a pre-signed S3 URL for downloading a specific salary slip based on employee name, month, and year. Admin/SuperAdmin users can download any employee's salary slips, while regular employees can only download their own.
 *     tags:
 *       - common
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mongoId
 *               - fullName
 *               - month
 *               - year
 *             properties:
 *               mongoId:
 *                 type: string
 *                 description: MongoDB ID of the employee (must match authenticated user)
 *                 example: 642f3c1a5e9b8a00123abcde
 *               fullName:
 *                 type: string
 *                 description: Full name of the employee
 *                 example: John Doe
 *               month:
 *                 type: string
 *                 description: 3-letter month abbreviation
 *                 example: Feb
 *               year:
 *                 type: string
 *                 description: 4-digit year
 *                 example: "2026"
 *     responses:
 *       200:
 *         description: Successfully generated download URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Salary slip download URL fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                       format: uri
 *                       description: Pre-signed S3 URL valid for 5 minutes
 *                       example: https://srytal-documents.s3.amazonaws.com/SalarySlips/...
 *                     fileName:
 *                       type: string
 *                       example: John-Doe-Feb-2026.pdf
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters. mongoId, fullName, month, and year are required
 *       401:
 *         description: Unauthorized (JWT missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No token provided !
 *       403:
 *         description: Forbidden - Non-admin user attempting to access another employee's salary slips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You are not authorized to access this employee's salary slips
 *       404:
 *         description: Salary slip not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Salary slip not found for the specified month and year
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error occurred while fetching salary slip download URL
 */
commonRouter.post('/downloadSalarySlip', validateJWT, downloadSalarySlipController.downloadSalarySlipController);

export default commonRouter;
