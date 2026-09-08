import express, { Router } from 'express';
import commonController from '../controllers/common/commonController';
import sendContactUsMailController from '../controllers/common/sendContactUsMailController';
import updateApplicationWalkThroughController from '../controllers/common/updateApplicationWalkThroughController';
import updatePasswordController from '../controllers/common/updatePasswordController';
import getOrganizationThemesController from '../controllers/common/getOrganizationThemesController';
import getEmployeeDetailsController from '../controllers/common/getEmployeeDetailsController';
import getEmployeeDashboardController from '../controllers/common/getEmployeeDashboardController';
import getMyNavMenuController from '../controllers/common/getMyNavMenuController';
import uploadProfileImageController from '../controllers/common/uploadProfileImageController';
import getProfileImageController from '../controllers/common/getProfileImageController';
import validateJWT from '../middlewares/validateJWT';
import multer from 'multer';
import forgotPasswordController from '../controllers/common/forgotPasswordController';
import employeePackageDetailsByIdController from '../controllers/common/employeePackageDetailsByIdController';
import updateEmployeeTimesheetController from '../controllers/common/updateEmployeeTimesheetController';
import downloadSalarySlipController from '../controllers/common/downloadSalarySlipController';
import getMyAssignedCoursesController from '../controllers/common/getMyAssignedCoursesController';
import getMyAssignedCourseByIdController from '../controllers/common/getMyAssignedCourseByIdController';
import updateMyTaskProgressController from '../controllers/common/updateMyTaskProgressController';
import addTaskProgressController from '../controllers/admin/addTaskProgressController';
import expertConsultationController from '../controllers/common/expertConsultationController';
import userOpenRouterKeyController from '../controllers/common/userOpenRouterKeyController';
import getUserOpenRouterKeyController from '../controllers/common/getUserOpenRouterKeyController'; 

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
 *         description: login Successfully !!
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

/**
 * @swagger
 * /sendContactUsMail:
 *   post:
 *     summary: Send Contact Us Email
 *     description: Sends a contact email to the admin with customer details.
 *     tags: 
 *      - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - customerEmail
 *               - subject
 *               - message
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: ABC Technologies
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               subject:
 *                 type: string
 *                 example: Inquiry about your services
 *               message:
 *                 type: string
 *                 example: We would like to discuss potential collaboration.
 *     responses:
 *       200:
 *         description: Mail sent successfully
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
 *                   example: Mail sent successfully !
 *       500:
 *         description: Failed to send email
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
 *                   example: Failed to send notification email.
 */
commonRouter.post('/sendContactUsMail', sendContactUsMailController.sendContactUsMail);

/**
 * @swagger
 * /updateApplicationWalkThrough:
 *   post:
 *     summary: Update Application Walkthrough Status
 *     description: Updates the application walkthrough step/status for a specific user.
 *     tags:
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - applicationWalkThrough
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: MongoDB User ID
 *                 example: "65f1c2e8a1234567890abcde"
 *               applicationWalkThrough:
 *                 type: number
 *                 description: Walkthrough step number or completion flag
 *                 example: 1
 *     responses:
 *       200:
 *         description: Application walkthrough updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Error occurred while updating application walkthrough
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
 *                   example: "Error occurred while updating application walkthrough"
 */
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
 *         description: Employee details fetched successfully !!
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
 *                       example: "10-Mar-1990"
 *                     panCardNumber:
 *                      type: string
 *                      example: ABCDE1234F
 *                     aadharNumber:
 *                      type: string
 *                      example: "1234-5678-9012"
 *                     uanNumber:
 *                      type: string
 *                      example: "123456789012345"
 *                     dateOfJoining:
 *                      type: string
 *                      format: date
 *                      example: "15-Jan-2020"
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
 * /getEmployeeDashboard:
 *   get:
 *     summary: Get aggregated dashboard data for the logged-in employee
 *     description: Returns profile summary, timesheet stats (this month/week), active projects with logged hours, timesheet status breakdown, and recent timesheet entries for the authenticated employee.
 *     tags:
 *       - Common
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 profile:
 *                   type: object
 *                 stats:
 *                   type: object
 *                 statusCounts:
 *                   type: object
 *                 projects:
 *                   type: array
 *                 recentEntries:
 *                   type: array
 *       500:
 *         description: Error while fetching dashboard data
 */
commonRouter.get('/getEmployeeDashboard', validateJWT, getEmployeeDashboardController.getEmployeeDashboard);

/**
 * @swagger
 * /getMyNavMenu:
 *   get:
 *     summary: Get the effective navigation menu for the logged-in user
 *     description: Returns the resolved menu tree (role grant + per-user overrides, minus revocations, plus system items) and the flat list of allowed org-relative URLs used for client-side route enforcement.
 *     tags:
 *       - Common
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Menu resolved successfully
 *       500:
 *         description: Error while resolving the navigation menu
 */
commonRouter.get('/getMyNavMenu', validateJWT, getMyNavMenuController.getMyNavMenu);

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

/**
 * @swagger
 * /fetchEmployeePackageDetailsById:
 *   post:
 *     summary: Fetch Employee Package Details By ID
 *     description: Returns employee package details including packages, tasks and filtered timesheet data between startDate and endDate.
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
 *               - employeeId
 *               - startDate
 *               - endDate
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Optional. If provided, data will be fetched for this employee instead of userId.
 *                 example: "64f1c2e8a1234567890abcdf"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Successfully fetched employee package details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 employeePackageDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65a2c9e8a1234567890abcde"
 *                       employeeId:
 *                         type: string
 *                         example: "64f1c2e8a1234567890abcde"
 *                       packages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             packageId:
 *                               type: object
 *                               description: Populated package details
 *                             tasks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   taskId:
 *                                     type: object
 *                                     description: Populated task details
 *                                   timesheet:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       properties:
 *                                         date:
 *                                           type: string
 *                                           format: date
 *                                           example: "2025-01-15"
 *                                         hours:
 *                                           type: number
 *                                           example: 8
 *       400:
 *         description: Missing required startDate or endDate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "FROM date and TO date are required !!"
 *       500:
 *         description: Internal server error while fetching package details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Error while fetching employee package details"
 */
commonRouter.post('/fetchEmployeePackageDetailsById', validateJWT, employeePackageDetailsByIdController.employeePackageDetailsById);

/**
 * @swagger
 * /updateEmployeeTimesheet:
 *   put:
 *     summary: Update Employee Timesheet
 *     description: Updates employee timesheet entries for specific packages and tasks. Only provided fields (except _id and date) will be updated.
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
 *               - packages
 *             properties:
 *               packages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - packageId
 *                     - tasks
 *                   properties:
 *                     packageId:
 *                       type: string
 *                       example: "681aedaae9ba3f1f97143cf3"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - taskId
 *                           - timesheet
 *                         properties:
 *                           taskId:
 *                             type: string
 *                             example: "684a6dea7bc74ad8b336e305"
 *                           timesheet:
 *                             type: array
 *                             items:
 *                               type: object
 *                               required:
 *                                 - date
 *                               properties:
 *                                 date:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2025-06-28T18:30:00.000Z"
 *                                 isHoliday:
 *                                   type: boolean
 *                                   example: false
 *                                 isVacation:
 *                                   type: boolean
 *                                   example: false
 *                                 isWeekOff:
 *                                   type: boolean
 *                                   example: false
 *                                 hours:
 *                                   type: number
 *                                   example: 8
 *                                 comments:
 *                                   type: string
 *                                   example: "working on Nodejs project"
 *                                 leaveReason:
 *                                   type: string
 *                                   example: ""
 *                                 status:
 *                                   type: string
 *                                   example: "SUBMITTED AND WAITING FOR APPROVAL"
 *     responses:
 *       200:
 *         description: Timesheet updated successfully or validation response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responseAfterUpdateTimesheet:
 *                   type: object
 *                   description: MongoDB update result object
 *                 message:
 *                   type: string
 *                   example: "No valid updates found in payload"
 *       500:
 *         description: Internal server error while updating timesheet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Error while updating employee timesheet"
 */
commonRouter.put('/updateEmployeeTimesheet', validateJWT, updateEmployeeTimesheetController.updateEmployeeTimesheet);

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
commonRouter.post('/downloadSalarySlip', validateJWT, downloadSalarySlipController.downloadSalarySlip);

/**
 * @swagger
 * /getMyAssignedCourses:
 *   get:
 *     summary: Get the courses assigned to the logged-in employee
 *     description: |
 *       Returns every course assigned to the authenticated employee together with
 *       the progress needed to render the course list. `status` and `progress` are
 *       derived from the employee's task-progress records, so they always reflect
 *       the actual completion state. The module/task tree is not included here —
 *       fetch it with `/getMyAssignedCourseById/{courseAssignmentId}`.
 *     tags:
 *       - My Courses
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the assigned courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       courseAssignmentId:
 *                         type: string
 *                         example: "66d123456789abcdef123456"
 *                       courseId:
 *                         type: string
 *                         example: "64f123456789abcdef123456"
 *                       courseName:
 *                         type: string
 *                         example: "Node.js"
 *                       courseDescription:
 *                         type: string
 *                         example: "<p>Complete Node.js backend course</p>"
 *                       thumbnailUrl:
 *                         type: string
 *                         format: uri
 *                       status:
 *                         type: string
 *                         enum:
 *                           - Assigned
 *                           - In Progress
 *                           - Completed
 *                         example: In Progress
 *                       assignedAt:
 *                         type: string
 *                         format: date-time
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       isOverdue:
 *                         type: boolean
 *                         example: false
 *                       totalModules:
 *                         type: integer
 *                         example: 4
 *                       progress:
 *                         type: object
 *                         properties:
 *                           totalTasks:
 *                             type: integer
 *                             example: 12
 *                           completedTasks:
 *                             type: integer
 *                             example: 5
 *                           percentComplete:
 *                             type: integer
 *                             example: 42
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error.
 */
commonRouter.get('/getMyAssignedCourses', validateJWT, getMyAssignedCoursesController.getMyAssignedCourses);

/**
 * @swagger
 * /getMyAssignedCourseById/{courseAssignmentId}:
 *   get:
 *     summary: Get one assigned course with its modules, tasks and progress
 *     description: |
 *       Returns a single course assignment belonging to the authenticated employee,
 *       expanded into its module -> task tree with per-task completion state. Only
 *       ACTIVE modules and tasks are returned. The assignment is looked up by id
 *       **and** employee, so an employee cannot read another employee's assignment.
 *
 *       Task content is not inlined: `LINK` tasks expose the external URL as `link`,
 *       while `FILE` tasks are streamed through
 *       `/contentwriter/getCourseTaskContent/{taskId}`.
 *     tags:
 *       - My Courses
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseAssignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course assignment to retrieve
 *     responses:
 *       200:
 *         description: Successfully fetched the assigned course.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 course:
 *                   type: object
 *                   properties:
 *                     courseAssignmentId:
 *                       type: string
 *                     courseId:
 *                       type: string
 *                     courseName:
 *                       type: string
 *                     courseDescription:
 *                       type: string
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                     status:
 *                       type: string
 *                       example: In Progress
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                     isOverdue:
 *                       type: boolean
 *                     progress:
 *                       type: object
 *                       properties:
 *                         totalTasks:
 *                           type: integer
 *                         completedTasks:
 *                           type: integer
 *                         percentComplete:
 *                           type: integer
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           moduleName:
 *                             type: string
 *                           moduleDescription:
 *                             type: string
 *                           totalTasks:
 *                             type: integer
 *                           completedTasks:
 *                             type: integer
 *                           tasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 taskName:
 *                                   type: string
 *                                 taskDescription:
 *                                   type: string
 *                                 type:
 *                                   type: string
 *                                   enum:
 *                                     - FILE
 *                                     - LINK
 *                                 link:
 *                                   type: string
 *                                   description: External URL, only present for LINK tasks.
 *                                 contentMimeType:
 *                                   type: string
 *                                   example: video/mp4
 *                                 contentFileName:
 *                                   type: string
 *                                   example: intro.mp4
 *                                 isCompleted:
 *                                   type: boolean
 *                                 completedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       404:
 *         description: Course assignment not found for this employee.
 *       500:
 *         description: Server error.
 */
commonRouter.get(
    '/getMyAssignedCourseById/:courseAssignmentId',
    validateJWT,
    getMyAssignedCourseByIdController.getMyAssignedCourseById
);

/**
 * @swagger
 * /updateMyTaskProgress:
 *   put:
 *     summary: Mark a task of an assigned course complete or incomplete
 *     description: |
 *       Upserts the authenticated employee's progress record for one task of an
 *       assigned course, then re-derives the course assignment status from the
 *       resulting counts (`Assigned` -> `In Progress` -> `Completed`) and returns
 *       the refreshed progress.
 *     tags:
 *       - My Courses
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseAssignmentId
 *               - taskId
 *               - isCompleted
 *             properties:
 *               courseAssignmentId:
 *                 type: string
 *                 example: "66d123456789abcdef123456"
 *               taskId:
 *                 type: string
 *                 example: "66d323456789abcdef123456"
 *               isCompleted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Progress updated successfully.
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
 *                   example: Progress updated successfully !
 *                 courseStatus:
 *                   type: string
 *                   example: In Progress
 *                 progress:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                       example: 12
 *                     completedTasks:
 *                       type: integer
 *                       example: 6
 *                     percentComplete:
 *                       type: integer
 *                       example: 50
 *                 task:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                     isCompleted:
 *                       type: boolean
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       400:
 *         description: Missing fields, or the task does not belong to the assigned course.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       404:
 *         description: Course assignment not found for this employee.
 *       500:
 *         description: Server error.
 */
commonRouter.put('/updateMyTaskProgress', validateJWT, updateMyTaskProgressController.updateMyTaskProgress);

/**
 * @swagger
 * /addtaskprogress:
 *   post:
 *     summary: Create a task progress record for an assigned course
 *     description: |
 *       Initializes a task-progress record (`isCompleted: false`) for a task of an
 *       assigned course. Usable by both employees (to register their own task
 *       progress) and admins (to register progress on behalf of an employee).
 *     tags:
 *       - My Courses
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseAssignmentId
 *               - moduleId
 *               - taskId
 *             properties:
 *               courseAssignmentId:
 *                 type: string
 *                 example: "66d123456789abcdef123456"
 *               moduleId:
 *                 type: string
 *                 example: "66d223456789abcdef123456"
 *               taskId:
 *                 type: string
 *                 example: "66d323456789abcdef123456"
 *     responses:
 *       201:
 *         description: Task progress created successfully.
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
 *                   example: Task progress created successfully !
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields or an error occurred while creating progress.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       409:
 *         description: Task progress already exists for this course/module/task.
 *       500:
 *         description: Server error.
 */
commonRouter.post('/addtaskprogress', validateJWT, addTaskProgressController.addTaskProgress);

/**
 * @swagger
 * /expertconsultation:
 *   post:
 *     summary: Submit an expert consultation request
 *     description: Creates a new expert consultation request and sends confirmation emails to customer and admin.
 *     tags:
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - projectBudget
 *               - timeline
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               company:
 *                 type: string
 *                 example: ABC Technologies
 *               projectBudget:
 *                 type: string
 *                 example: "10000-25000"
 *               timeline:
 *                 type: string
 *                 example: "3 months"
 *     responses:
 *       201:
 *         description: Consultation request submitted successfully
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
 *                   example: Expert consultation request submitted successfully
 *                 data:
 *                   type: object
 *       500:
 *         description: Failed to submit expert consultation request
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
 *                   example: Failed to submit expert consultation request
 */
commonRouter.post('/expertconsultation', expertConsultationController.createExpertConsultation);

/**
 * @swagger
 * /UserOpenRouterKey:
 *   post:
 *     summary: Save user OpenRouter API key
 *     description: Saves the OpenRouter API key for the authenticated user. The user ID is retrieved from the JWT token and does not need to be provided in the request body.
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
 *               - openrouterKey
 *             properties:
 *               openrouterKey:
 *                 type: string
 *                 description: OpenRouter API key of the authenticated user
 *                 example: sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
 *     responses:
 *       201:
 *         description: User OpenRouter key added successfully
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
 *                   example: User OpenRouter key added successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68c123456789abcdef123456
 *                     userId:
 *                       type: string
 *                       example: 68b123456789abcdef123456
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *
 *       400:
 *         description: OpenRouter key is missing
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
 *                   example: OpenRouter key is required.
 *
 *       401:
 *         description: User ID was not found in JWT token
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
 *                   example: User ID not found.
 *
 *       404:
 *         description: User not found
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
 *                   example: User not found.
 *
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
 *                   example: Internal server error.
 */
commonRouter.post('/UserOpenRouterKey', validateJWT, userOpenRouterKeyController.userOpenRouterKey);

/**
 * @swagger
 * /getUserOpenRouterKey/{id}:
 *   get:
 *     summary: Get OpenRouter key for a user by user ID
 *     tags: 
 *      - Common
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose OpenRouter key needs to be fetched
 *         example: 68b123456789abcdef123456
 *     responses:
 *       200:
 *         description: OpenRouter key fetched successfully
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
 *                   example: OpenRouter key fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68c123456789abcdef123456
 *                     userId:
 *                       type: string
 *                       example: 68b123456789abcdef123456
 *                     openrouterKey:
 *                       type: string
 *                       example: sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *
 *       400:
 *         description: User ID is missing
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
 *                   example: User ID is required.
 *
 *       401:
 *         description: User ID was not found in JWT token
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
 *                   example: User ID not found.
 *
 *       404:
 *         description: User or OpenRouter key not found
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
 *                   example: OpenRouter key not found for this user.
 *
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
 *                   example: error occurred while fetching OpenRouter key, Please try again !
 */
commonRouter.get('/getUserOpenRouterKey/:id', validateJWT, getUserOpenRouterKeyController.getUserOpenRouterKey);

export default commonRouter;
