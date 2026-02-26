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

/**
 * @swagger
 * /updatePassword:
 *   post:
 *     summary: Update user password
 *     tags: 
 *       - Common
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64f1c9e9e8a3b2a4c8f12345"
 *               oldPassword:
 *                 type: string
 *                 example: "Temp@123"
 *               newPassword:
 *                 type: string
 *                 example: "NewStrong@123"
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: Password updated Successfully !
 *       401:
 *         description: Unauthorized / Invalid password
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
 *                   example: Temporary password is not matched !
 *       500:
 *         description: Server error
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
 *                   example: Error occured while updating the password !
 */
commonRouter.post('/updatePassword', validateJWT, updatePasswordController.updatePassword);

/**
 * @swagger
 * /getOrganizationThemes/{organization_name}:
 *   get:
 *     summary: Get themes by organization name
 *     tags: 
 *       - Common
 *     parameters:
 *       - in: path
 *         name: organization_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the organization
 *         example: "AcmeCorp"
 *     responses:
 *       200:
 *         description: Themes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 themesResponse:
 *                   type: object
 *                   description: Organization themes data
 *                   example:
 *                     _id: "65a123abc456def789012345"
 *                     organization_name: "AcmeCorp"
 *                     primaryColor: "#1976d2"
 *                     secondaryColor: "#ffffff"
 *                     logoUrl: "https://example.com/logo.png"
 *       500:
 *         description: Error while fetching organization themes
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
 *                   example: Error occured while fetching the themes !
 */
commonRouter.get('/getOrganizationThemes/:organization_name', getOrganizationThemesController.getOrganizationThemes);

/**
 * @swagger
 * /getEmployeeDetails:
 *   get:
 *     summary: Get employee details by user ID
 *     tags: 
 *      - Common
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee user ID
 *         example: "65b1f9e8a3c2d4f123456789"
 *     responses:
 *       200:
 *         description: Employee details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 employeeDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65b1f9e8a3c2d4f123456789"
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     mobileNumber:
 *                       type: string
 *                       example: "9876543210"
 *                     bloodGroup:
 *                       type: object
 *                       description: Blood group details 
 *                     bankDetailsInfo:
 *                       type: object
 *                       description: Bank details of employee
 *                     employeeRole:
 *                       type: object
 *                       description: Employee role details 
 *                     employmentType:
 *                       type: object
 *                       description: Employment type details
 *                     organization:
 *                       type: object
 *                       description: Organization details 
 *                     userRole:
 *                       type: string
 *                       example: EMPLOYEE
 *                     passwordResetRequired:
 *                       type: boolean
 *                       example: false
 *                     employeeId:
 *                       type: string
 *                       example: EMP001
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: "1995-08-15"
 *                     presentAddress:
 *                       type: string
 *                       example: Hyderabad, India
 *                     permanentAddress:
 *                       type: string
 *                       example: Hyderabad, India
 *       500:
 *         description: Error while fetching employee details
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
 *                   example: Error in fetching employee details
 */
commonRouter.get('/getEmployeeDetails', validateJWT, getEmployeeDetailsController.getEmployeeDetails);

/**
 * @swagger
 * /uploadProfileImage:
 *   post:
 *     summary: Upload employee profile image
 *     tags: 
 *      - Common
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - profileImage
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65b1f9e8a3c2d4f123456789"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (jpg, png, etc.)
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: No file uploaded
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: No file uploaded.
 *       401:
 *         description: Unauthorized or update failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Error while uploading profile image
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
 *                   example: Error occured while updating the Profile Image
 */
commonRouter.post('/uploadProfileImage', upload.single('profileImage'), validateJWT, uploadProfileImageController.uploadProfileImage);

/**
 * @swagger
 * /getProfileImage:
 *   get:
 *     summary: Get employee profile image
 *     tags: 
 *     - Common
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee user ID
 *         example: "65b1f9e8a3c2d4f123456789"
 *     responses:
 *       200:
 *         description: Profile image fetched successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Error while fetching image from S3
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error while fetching profile image
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
 *                   example: Error occured while fetching the Profile Image
 */
commonRouter.get('/getProfileImage', validateJWT, getProfileImageController.getProfileImage);

/**
 * @swagger
 * /forgotPassword:
 *   post:
 *     summary: Generate temporary password and send to registered email
 *     tags: 
 *     - Common
 *     security:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Temporary password sent successfully
 *       401:
 *         description: Unauthorized (Invalid or missing JWT)
 *       500:
 *         description: Server error
 */
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
 *       - Common
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
