import express, { Router } from 'express';
import registerEmployeeByAdminController from '../controllers/admin/registrationController';
import getEmployeeDetailsByAdminController from '../controllers/admin/getEmployeeDetailsByAdminController';
import updateEmployeeDetailsByAdminController from '../controllers/admin/updateEmployeeDetailsByAdminController';
import commonController from '../controllers/common/commonController';
import userSchema from '../middlewares/schemas/userSchema';
import validateProfileRequest from '../middlewares/validateProfileUpdate';
import getAllEmployeeDetailsByAdminController from '../controllers/admin/getAllEmployeeDetailsByAdminController';
import employeePasswordResetByAdminController from '../controllers/admin/employeePasswordResetByAdminController';
import getAllBloodGroupsByAdminController from '../controllers/admin/getAllBloodGroupsByAdminController';
import addBloodGroupByAdminController from '../controllers/admin/addBloodGroupByAdminController';
import deleteEmployeeDetailsByAdminController from '../controllers/admin/deleteEmployeeDetailsByAdminController';
import validateJWT from '../middlewares/validateJWT';
import deleteBloodGroupByAdminController from '../controllers/admin/deleteBloodGroupByAdminController';
import updateBloodGroupByAdminController from '../controllers/admin/updateBloodGroupByAdminController';
import addEmploymentTypeByAdminController from '../controllers/admin/addEmploymentTypeByAdminController';
import getAllEmploymentTypesByAdminController from '../controllers/admin/getAllEmploymentTypesByAdminController';
import updateEmploymentTypeByAdminController from '../controllers/admin/updateEmploymentTypeByAdminController';
import deleteEmploymentTypeByAdminController from '../controllers/admin/deleteEmploymentTypeByAdminController';
import addEmployeeRoleByAdminController from '../controllers/admin/addEmployeeRoleByAdminController';
import getAllEmployeeRoleByAdminController from '../controllers/admin/getAllEmployeeRoleByAdminController';
import updateEmployeeRoleByAdminController from '../controllers/admin/updateEmployeeRoleByAdminController';
import deleteEmployeeRoleByAdminController from '../controllers/admin/deleteEmployeeRoleByAdminController';
import deletePoolCandidateByadminController from '../controllers/admin/deletePoolCandidatesByAdminController';
import deletePoolCompanyByAdminController from '../controllers/admin/deletePoolCompanyByAdminController';
import addPackageByAdminController from '../controllers/admin/addPackageByAdminController';
import getAllPackagesByAdminController from '../controllers/admin/getAllPackagesByAdminController';
import getPackageDetailsByAdminController from '../controllers/admin/getPackageDetailsByAdminController';
import deletePackageByAdminController from '../controllers/admin/deletePackageByAdminController';
import updatePackageByAdminController from '../controllers/admin/updatePackageByAdminController';
import addTaskToPackageByAdminController from '../controllers/admin/addTaskByAdminController';
import updateTaskByAdminController from '../controllers/admin/updateTaskByAdminController';
import deleteTaskByAdminController from '../controllers/admin/deleteTaskByAdminController';
import addPackageToEmployeeByAdminController from '../controllers/admin/addPackageToEmployeeByAdminController';
import getEmployeePackageByAdminController from '../controllers/admin/getEmployeePackagesByAdminController';
import deleteEmployeePackagesByAdminController from '../controllers/admin/deleteEmployeePackagesByAdminController';
import deleteEmployeeTaskByAdminController from '../controllers/admin/deleteEmployeeTaskByAdminController';
import generateSalarySlipByAdminController from '../controllers/admin/generateSalarySlipByAdminController';
import validateRegistrationSchema from '../middlewares/validateRegistrationSchema';
import registrationSchema from '../middlewares/schemas/registrationSchema';
import addFeedbackAttributeByAdminController from '../controllers/admin/addFeedbackAttributeByAdminController'
import updateFeedbackAttributeByAdminController from '../controllers/admin/updateFeedbackAttributeByAdminController';
import getFeedbackAttributeByAdminController from '../controllers/admin/getFeedbackAttributeByAdminController';
import getAllFeedbackAttributeByAdminController from '../controllers/admin/getAllFeedbackAttributeByAdminController';
import deleteFeedbackAttributeByAdminController from '../controllers/admin/deleteFeedbackAttributeByAdminController';
import generateOfferLetterByAdminController from '../controllers/admin/generateOfferLetterByAdminController';

const adminRouter: Router = express.Router();

adminRouter.post('/login', commonController.login);
adminRouter.get('/refreshToken', commonController.refreshToken);
adminRouter.get('/logout', validateJWT, commonController.logout);

/**
 * @swagger
 * /admin/registerEmployeeByAdmin:
 *   post:
 *     summary: Register a new employee by admin
 *     description: 
 *       Allows an authenticated admin to register a user.
 *       A random password is generated by the system and sent to the user's email.
 *       The user is required to reset the password on first login.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - mobileNumber
 *               - userRole
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               userRole:
 *                 type: string
 *                 description: User role 
 *                 enum:
 *                   - Employee
 *                   - Recruiter
 *                   - ContentWriter
 *                 example: Employee
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registered Successfully !
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already exists
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User creation failed
 */
adminRouter.post('/registerEmployeeByAdmin', validateJWT, validateRegistrationSchema(registrationSchema), registerEmployeeByAdminController.register);

/**
 * @swagger
 * /admin/getEmployeeDetailsByAdmin/{id}:
 *   get:
 *     summary: Get employee details by admin
 *     description: Fetch detailed information of a specific employee by employee ID. Requires admin authentication.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f1a2b9c123456789abcd03"
 *         description: Employee user ID
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
 *                 userDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f1a2b9c123456789abcd03"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     mobileNumber:
 *                       type: string
 *                       example: "9876543210"
 *                     employeeId:
 *                       type: string
 *                       example: "EMP-001"
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: "1995-06-15"
 *                     bloodGroup:
 *                       type: object
 *                       description: Blood group details (populated)
 *                     employmentType:
 *                       type: object
 *                       description: Employment type details (populated)
 *                     employeeRole:
 *                       type: object
 *                       description: Employee role details (populated)
 *                     organization:
 *                       type: object
 *                       description: Organization details (populated)
 *                     bankDetailsInfo:
 *                       type: object
 *                       description: Employee bank details
 *                     presentAddress:
 *                       type: string
 *                       example: "123 Main Street, City"
 *                     permanentAddress:
 *                       type: string
 *                       example: "456 Home Street, City"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
 *       404:
 *         description: Employee not found
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
 *                   example: "Error while fetching user details"
 */
adminRouter.get('/getEmployeeDetailsByAdmin/:id', validateJWT, getEmployeeDetailsByAdminController.getUserDetails);
adminRouter.put('/updateEmployeeDetailsByAdmin', validateProfileRequest(userSchema), validateJWT, updateEmployeeDetailsByAdminController.updateProfile);

/**
 * @swagger
 * /admin/getAllEmployeeDetailsByAdmin:
 *   get:
 *     summary: Get all employee details by admin
 *     description: Fetch all employees belonging to the logged-in admin's organization.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
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
 *                 usersList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b9c123456789abcd03"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       bloodGroup:
 *                         type: object
 *                       employmentType:
 *                         type: object
 *                       employeeRole:
 *                         type: object
 *                       organization:
 *                         type: object
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
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
 *                   example: "Error while fetching user details"
 */
adminRouter.get('/getAllEmployeeDetailsByAdmin', validateJWT, getAllEmployeeDetailsByAdminController.getAllEmployeeDetails);

/**
 * @swagger
 * /admin/employeePasswordResetByAdmin:
 *   post:
 *     summary: Reset employee password by admin
 *     description: Allows an admin to reset an employee's password. A temporary password is generated, hashed, saved, and emailed to the employee.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Unique identifier of the employee
 *                 example: EMP12345
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Password reset failed (user not found or error in reset)
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
 *                   example: "Unable to reset employee password"
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
 *                   example: "Unable to reset employee password"
 */
adminRouter.post('/employeePasswordResetByAdmin', employeePasswordResetByAdminController.employeePasswordResetByAdmin);
adminRouter.get('/getAllBloodGroupsByAdmin', validateJWT, getAllBloodGroupsByAdminController.getAllBloodGroupsDetails);
adminRouter.post('/addBloodGroupByAdmin', validateJWT, addBloodGroupByAdminController.addNewBloodgroupByAdmin);
adminRouter.post('/deleteEmployeeByAdmin', validateJWT, deleteEmployeeDetailsByAdminController.deleteProfile);
adminRouter.delete('/deleteBloodGroupByAdmin/:id', validateJWT, deleteBloodGroupByAdminController.deleteBloodGroup);
adminRouter.put('/updateBloodGroupByAdmin', validateJWT, updateBloodGroupByAdminController.updateBloodGroup);
adminRouter.post('/addEmploymentTypeByAdmin', validateJWT, addEmploymentTypeByAdminController.addEmploymentTypeByAdmin);
adminRouter.get('/getallEmploymentTypesByAdmin', validateJWT, getAllEmploymentTypesByAdminController.getAllEmploymentTypesByAdmin);
adminRouter.put('/updateEmploymentTypeByAdmin', validateJWT, updateEmploymentTypeByAdminController.updateEmploymentType);
adminRouter.delete('/deleteEmploymentTypeByAdmin/:id', validateJWT, deleteEmploymentTypeByAdminController.deleteEmploymentType);
adminRouter.post('/addEmployeeRoleByAdmin', validateJWT, addEmployeeRoleByAdminController.addEmployeeRoleByAdmin);
adminRouter.get('/getAllEmployeeRoleByAdmin', validateJWT, getAllEmployeeRoleByAdminController.getAllEmployeeRolesByAdmin);
adminRouter.put('/updateEmployeeRoleByAdmin', validateJWT, updateEmployeeRoleByAdminController.updateEmployeeRole);
adminRouter.delete('/deleteEmployeeRoleByAdmin/:id', validateJWT, deleteEmployeeRoleByAdminController.deleteEmployeeRole);
adminRouter.delete('/deletePoolCandidatesByAdmin/:id', validateJWT, deletePoolCandidateByadminController.deletePoolCandidateByAdmin);
adminRouter.delete('/deletePoolCompanyByAdmin/:id', validateJWT, deletePoolCompanyByAdminController.deletePoolCompanyByAdmin);

/**
 * @swagger
 * /admin/addPackageByAdmin:
 *   post:
 *     tags:
 *       - Admin 
 *     summary: Add package by admin
 *     description: Admin can add a new package using multipart form data. JWT authentication required.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Gold Package
 *               description:
 *                 type: string
 *                 example: Gold level subscription package
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-01
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-31
 *               approvers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: 65a8f1c2b3d4e5f678901234
 *               isDeleted:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Package added successfully
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
 *                   example: Package added successfully
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
 *                   example: Failed to add package
 */
adminRouter.post('/addPackageByAdmin', validateJWT, addPackageByAdminController.addPackageByAdminController);

/**
 * @swagger
 * /admin/getAllPackagesByAdmin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all packages with tasks (Admin)
 *     description: Fetch all non-deleted packages along with their associated tasks. JWT authentication is required.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Packages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 packagesList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65a8f1c2b3d4e5f678901234
 *                       title:
 *                         type: string
 *                         example: Gold Package
 *                       description:
 *                         type: string
 *                         example: Gold level subscription
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-01T00:00:00.000Z
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-12-31T23:59:59.000Z
 *                       approvers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 65b9f1c2b3d4e5f678901999
 *                             firstName:
 *                               type: string
 *                               example: John
 *                             lastName:
 *                               type: string
 *                               example: Doe
 *                       tasks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 66c9f1c2b3d4e5f678902222
 *                             title:
 *                               type: string
 *                               example: Initial Setup
 *                             createdBy:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: 65d9f1c2b3d4e5f678903333
 *                                 firstName:
 *                                   type: string
 *                                   example: Alice
 *                                 lastName:
 *                                   type: string
 *                                   example: Smith
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
 *                   example: Failed to fetch packages
 */
adminRouter.get('/getAllPackagesByAdmin', validateJWT, getAllPackagesByAdminController.getAllPackagesDetails);

/**
 * @swagger
 * /admin/getPackageDetailsByAdmin/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get package details by admin
 *     description: Fetch details of a single package along with associated tasks. JWT authentication required.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the package to fetch
 *         schema:
 *           type: string
 *           example: 65a8f1c2b3d4e5f678901234
 *     responses:
 *       200:
 *         description: Package details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 packageDetails:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 65a8f1c2b3d4e5f678901234
 *                     title:
 *                       type: string
 *                       example: Gold Package
 *                     description:
 *                       type: string
 *                       example: Gold level subscription
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-01T00:00:00.000Z
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-12-31T23:59:59.000Z
 *                     approvers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 65b9f1c2b3d4e5f678901999
 *                           firstName:
 *                             type: string
 *                             example: John
 *                           lastName:
 *                             type: string
 *                             example: Doe
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 66c9f1c2b3d4e5f678902222
 *                           title:
 *                             type: string
 *                             example: Initial Setup
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 65d9f1c2b3d4e5f678903333
 *                               firstName:
 *                                 type: string
 *                                 example: Alice
 *                               lastName:
 *                                 type: string
 *                                 example: Smith
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
 *                   example: Failed to fetch package details
 */
adminRouter.get('/getPackageDetailsByAdmin/:id', validateJWT, getPackageDetailsByAdminController.getPackageDetailsByAdmin);
adminRouter.delete('/deletePackageByAdmin/:id', validateJWT, deletePackageByAdminController.deletePackageByAdmin);
adminRouter.put('/updatePackageByAdmin', validateJWT, updatePackageByAdminController.updatePackageByAdminController);
adminRouter.post('/addTaskByAdmin', validateJWT, addTaskToPackageByAdminController.addTaskByAdminController);
adminRouter.put('/updateTaskByAdmin', validateJWT, updateTaskByAdminController.updateTaskByAdminController);
adminRouter.delete('/deleteTaskByAdmin/:id', validateJWT, deleteTaskByAdminController.deleteTaskByAdmin);
adminRouter.post('/addPackagetoEmployeeByAdmin', validateJWT, addPackageToEmployeeByAdminController.addPackageToEmployeeByAdmin);
adminRouter.get('/getEmployeePackagesByAdmin/:employeeId', validateJWT, getEmployeePackageByAdminController.getEmployeePackageDetailsByAdmin);
adminRouter.delete('/deleteEmployeePackagesByAdmin', validateJWT, deleteEmployeePackagesByAdminController.deleteEmployeePackageByAdmin);
adminRouter.delete('/deleteEmployeeTaskByAdmin', validateJWT, deleteEmployeeTaskByAdminController.deleteEmployeeTaskByAdmin);

/**
 * @swagger
 * /admin/generateSalarySlip:
 *   post:
 *     summary: Generate Salary Slip PDF
 *     description: Generates a salary slip PDF for an employee based on provided salary details. The PDF is returned as a downloadable file.
 *     tags:
 *       - Admin
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
 *               - employeeName
 *               - employeeEmail
 *               - designation
 *               - department
 *               - dateOfJoining
 *               - payPeriod
 *               - bankName
 *               - IFSCCODE
 *               - bankAccountNumber
 *               - transactionType
 *               - panNumber
 *               - totalWorkingDays
 *               - daysWorked
 *               - basicSalary
 *               - payDate
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Unique employee identifier
 *                 example: "EMP001"
 *               employeeName:
 *                 type: string
 *                 description: Full name of the employee
 *                 example: "Ramya Thummala"
 *               employeeEmail:
 *                 type: string
 *                 description: Employee email address for salary notification
 *                 example: "ramya@srytal.com"
 *               designation:
 *                 type: string
 *                 description: Job title/designation
 *                 example: "JUNIOR SOFTWARE ENGINEER (FTE)"
 *               department:
 *                 type: string
 *                 description: Department name
 *                 example: "Engineering"
 *               dateOfJoining:
 *                 type: string
 *                 description: Date of joining (YYYY-MM-DD)
 *                 example: "2024-01-15"
 *               payPeriod:
 *                 type: string
 *                 description: Pay period month and year
 *                 example: "January 2026"
 *               bankName:
 *                 type: string
 *                 description: Employee bank name
 *                 example: "HDFC Bank"
 *               IFSCCODE:
 *                 type: string
 *                 description: Bank IFSC code
 *                 example: "SBIN0001007"
 *               bankAccountNumber:
 *                 type: string
 *                 description: Employee bank account number
 *                 example: "1234567890"
 *               transactionType:
 *                 type: string
 *                 description: Payment transaction type (NEFT/IMPS/RTGS)
 *                 example: "NEFT"
 *               transactionId:
 *                 type: string
 *                 description: Transaction reference ID (optional)
 *                 example: "ABCD13234545567SFFDGF"
 *               panNumber:
 *                 type: string
 *                 description: Employee PAN number
 *                 example: "ABCDE1234F"
 *               uanNumber:
 *                 type: string
 *                 description: Universal Account Number for PF (optional)
 *                 example: N/A
 *               totalWorkingDays:
 *                 type: number
 *                 description: Total working days in the month
 *                 example: 22
 *               daysWorked:
 *                 type: number
 *                 description: Actual days worked by employee
 *                 example: 22
 *               lossOfPayDays:
 *                 type: number
 *                 description: Loss of pay days (optional, default 0)
 *                 example: 0
 *               basicSalary:
 *                 type: number
 *                 description: Basic salary amount
 *                 example: 5000
 *               hraPercentage:
 *                 type: number
 *                 description: HRA percentage of basic (optional, default 0%)
 *                 example: 0
 *               specialAllowance:
 *                 type: number
 *                 description: Special allowance amount (optional)
 *                 example: 0
 *               otherAllowances:
 *                 type: number
 *                 description: Other allowances amount (optional)
 *                 example: 1000
 *               pfPercentage:
 *                 type: number
 *                 description: PF percentage of basic (optional, default 0%)
 *                 example: 0
 *               professionalTax:
 *                 type: number
 *                 description: Professional tax amount (optional, default 0)
 *                 example: 0
 *               incomeTax:
 *                 type: number
 *                 description: Income tax/TDS amount (optional)
 *                 example: 0
 *               otherDeductions:
 *                 type: number
 *                 description: Other deductions (optional)
 *                 example: 0
 *               payDate:
 *                 type: string
 *                 description: Payment date shown in footer (YYYY-MM-DD)
 *                 example: "2026-01-31"
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request data
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
 *                   example: Missing required fields for salary slip generation
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
 *                   example: An unexpected error occurred while generating salary slip
 */
adminRouter.post('/generateSalarySlip', validateJWT, generateSalarySlipByAdminController.generateSalarySlip);

/**
 * @swagger
 * /admin/previewSalarySlip:
 *   post:
 *     summary: Preview Salary Slip
 *     description: Generates a salary slip and returns it as base64 along with calculation details for preview purposes.
 *     tags:
 *       - Admin
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
 *               - employeeName
 *               - employeeEmail
 *               - designation
 *               - department
 *               - dateOfJoining
 *               - payPeriod
 *               - bankName
 *               - IFSCCODE
 *               - bankAccountNumber
 *               - transactionType
 *               - panNumber
 *               - totalWorkingDays
 *               - daysWorked
 *               - basicSalary
 *               - payDate
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Unique employee identifier
 *                 example: "EMP001"
 *               employeeName:
 *                 type: string
 *                 description: Full name of the employee
 *                 example: "Ramya Thummala"
 *               employeeEmail:
 *                 type: string
 *                 description: Employee email address for salary notification
 *                 example: "ramya@srytal.com"
 *               designation:
 *                 type: string
 *                 description: Job title/designation
 *                 example: "JUNIOR SOFTWARE ENGINEER (FTE)"
 *               department:
 *                 type: string
 *                 description: Department name
 *                 example: "Engineering"
 *               dateOfJoining:
 *                 type: string
 *                 description: Date of joining (YYYY-MM-DD)
 *                 example: "2024-01-15"
 *               payPeriod:
 *                 type: string
 *                 description: Pay period month and year
 *                 example: "January 2026"
 *               bankName:
 *                 type: string
 *                 description: Employee bank name
 *                 example: "HDFC Bank"
 *               IFSCCODE:
 *                 type: string
 *                 description: Bank IFSC code
 *                 example: "SBIN0001007"
 *               bankAccountNumber:
 *                 type: string
 *                 description: Employee bank account number
 *                 example: "1234567890"
 *               transactionType:
 *                 type: string
 *                 description: Payment transaction type (NEFT/IMPS/RTGS)
 *                 example: "NEFT"
 *               transactionId:
 *                 type: string
 *                 description: Transaction reference ID (optional)
 *                 example: "ABCD13234545567SFFDGF"
 *               panNumber:
 *                 type: string
 *                 description: Employee PAN number
 *                 example: "ABCDE1234F"
 *               uanNumber:
 *                 type: string
 *                 description: Universal Account Number for PF (optional)
 *                 example: N/A
 *               totalWorkingDays:
 *                 type: number
 *                 description: Total working days in the month
 *                 example: 22
 *               daysWorked:
 *                 type: number
 *                 description: Actual days worked by employee
 *                 example: 22
 *               lossOfPayDays:
 *                 type: number
 *                 description: Loss of pay days (optional, default 0)
 *                 example: 0
 *               basicSalary:
 *                 type: number
 *                 description: Basic salary amount
 *                 example: 5000
 *               hraPercentage:
 *                 type: number
 *                 description: HRA percentage of basic (optional, default 0%)
 *                 example: 0
 *               specialAllowance:
 *                 type: number
 *                 description: Special allowance amount (optional)
 *                 example: 0
 *               otherAllowances:
 *                 type: number
 *                 description: Other allowances amount (optional)
 *                 example: 1000
 *               pfPercentage:
 *                 type: number
 *                 description: PF percentage of basic (optional, default 0%)
 *                 example: 0
 *               professionalTax:
 *                 type: number
 *                 description: Professional tax amount (optional, default 0)
 *                 example: 0
 *               incomeTax:
 *                 type: number
 *                 description: Income tax/TDS amount (optional)
 *                 example: 0
 *               otherDeductions:
 *                 type: number
 *                 description: Other deductions (optional)
 *                 example: 0
 *               payDate:
 *                 type: string
 *                 description: Payment date shown in footer (YYYY-MM-DD)
 *                 example: "2026-01-31"
 *     responses:
 *       200:
 *         description: Salary slip preview generated successfully
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
 *                   example: Salary slip generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                       example: "January-2026-Ramya-Thummala_Salary-Slip.pdf"
 *                     pdfBase64:
 *                       type: string
 *                       example: "JVBERi0xLjQKJeLjz9..."
 *                     calculations:
 *                       type: object
 *                       properties:
 *                         basicSalary:
 *                           type: number
 *                           example: 50000
 *                         hra:
 *                           type: number
 *                           example: 20000
 *                         specialAllowance:
 *                           type: number
 *                           example: 0
 *                         conveyanceAllowance:
 *                           type: number
 *                           example: 1600
 *                         medicalAllowance:
 *                           type: number
 *                           example: 1250
 *                         otherAllowances:
 *                           type: number
 *                           example: 1000
 *                         grossEarnings:
 *                           type: number
 *                           example: 82850
 *                         providentFund:
 *                           type: number
 *                           example: 6000
 *                         professionalTax:
 *                           type: number
 *                           example: 200
 *                         incomeTax:
 *                           type: number
 *                           example: 5000
 *                         otherDeductions:
 *                           type: number
 *                           example: 0
 *                         totalDeductions:
 *                           type: number
 *                           example: 11200
 *                         netPay:
 *                           type: number
 *                           example: 71650
 *                         netPayInWords:
 *                           type: string
 *                           example: "Rupees Seventy One Thousand Six Hundred Fifty Only"
 *       400:
 *         description: Invalid request data
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
 *                   example: Missing required fields for salary slip generation
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
 *                   example: An unexpected error occurred while generating salary slip
 */
adminRouter.post('/previewSalarySlip', validateJWT, generateSalarySlipByAdminController.previewSalarySlip);

/**
 * @swagger
 * /admin/addfeedbackattributebyadmin:
 *   post:
 *     summary: Add Feedback Attribute By Admin
 *     description: Admin can add a new feedback attribute by providing name, optional comment, and rating. JWT authentication required.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "name of the attribute"
 *     responses:
 *       200:
 *         description: Feedback attribute created successfully
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
 *                   example: Feedback added successfully !
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 63f5b9f2a1e4c2a7f8d6e1a2
 *                     name:
 *                       type: string
 *                       example: "Teamwork"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request - missing required fields
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
 *                   example: Name and rating are required.
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error
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
 *                   example: Failed to add feedback.
 */
adminRouter.post('/addfeedbackattributebyadmin', addFeedbackAttributeByAdminController.addFeedbackAttributeByAdminController);

/**
 * @swagger
 * /admin/updatefeedbackattributebyadmin:
 *   put:
 *     summary: Update Feedback Attribute by Admin
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     description: Updates the name of an existing feedback attribute by admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 example: "65f123abc4567890def12345"
 *               name:
 *                 type: string
 *                 example: "Service Quality"
 *     responses:
 *       200:
 *         description: Feedback attribute updated successfully
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
 *                   example: Feedback attribute updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
adminRouter.put('/updatefeedbackattributebyadmin', validateJWT, updateFeedbackAttributeByAdminController.updateFeedbackAttributeByAdminController);

/**
 * @swagger
 * /admin/getfeedbackattributebyadmin/{id}:
 *   get:
 *     summary: Get Feedback Attribute by Admin
 *     tags:
 *       - Admin 
 *     security:
 *       - BearerAuth: []
 *     description: Fetch a single feedback attribute by ID. Requires admin JWT authentication.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the feedback attribute to fetch
 *         required: true
 *         schema:
 *           type: string
 *           example: "65f123abc4567890def12345"
 *     responses:
 *       200:
 *         description: Feedback attribute fetched successfully
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
 *                   example: Feedback attribute fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65f123abc4567890def12345"
 *                     name:
 *                       type: string
 *                       example: "Service Quality"
 *       404:
 *         description: Feedback attribute not found
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
 *                   example: Feedback attribute not found
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
 *       500:
 *         description: Internal Server Error
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
 *                   example: Error fetching feedback attribute
 */
adminRouter.get('/getfeedbackattributebyadmin/:id', validateJWT, getFeedbackAttributeByAdminController.getFeedbackAttributeByAdminController);

/**
 * @swagger
 * /admin/getallfeedbackattributesbyadmin:
 *   get:
 *     summary: Get All Feedback Attributes
 *     tags:
 *       - Admin 
 *     security:
 *       - BearerAuth: []
 *     description: Fetch all feedback attributes. Requires admin JWT authentication.
 *     responses:
 *       200:
 *         description: Feedback attributes fetched successfully
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
 *                   example: Feedback attributes fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     feedbackAttributeResponse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "65f123abc4567890def12345"
 *                           name:
 *                             type: string
 *                             example: "Service Quality"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
 *       500:
 *         description: Internal Server Error
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
 *                   example: Error fetching feedback attributes
 */
adminRouter.get('/getallfeedbackattributesbyadmin', validateJWT, getAllFeedbackAttributeByAdminController.getAllFeedbackAttributesByAdminController);

/**
 * @swagger
 * /admin/deletefeedbackattributebyadmin/{id}:
 *   delete:
 *     summary: Delete Feedback Attribute by Admin
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     description: Deletes a feedback attribute by its ID. Requires admin JWT authentication.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the feedback attribute to delete
 *         schema:
 *           type: string
 *           example: "65f123abc4567890def12345"
 *     responses:
 *       200:
 *         description: Feedback attribute deleted successfully
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
 *                   example: Feedback attribute deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     responseAfterDelete:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "65f123abc4567890def12345"
 *                         name:
 *                           type: string
 *                           example: "Service Quality"
 *       404:
 *         description: Feedback attribute not found
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
 *                   example: Feedback attribute not found
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
 *       500:
 *         description: Internal Server Error
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
 *                   example: Error deleting feedback attribute
 */
adminRouter.delete('/deletefeedbackattributebyadmin/:id', validateJWT, deleteFeedbackAttributeByAdminController.deleteFeedbackAttributeByAdminController);

/**
 * @swagger
 * /admin/generateOfferLetterByAdmin:
 *   post:
 *     summary: Generate Offer Letter PDF by Admin
 *     description: Generates an Offer Letter PDF based on the provided candidate and job details.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameOfTheCandidate
 *               - subject
 *               - role
 *               - dateOfJoining
 *               - compensation
 *               - workLocation
 *               - offerDate
 *             properties:
 *               nameOfTheCandidate:
 *                 type: string
 *                 example: John Doe
 *               subject:
 *                 type: string
 *                 example: Offer of Appointment for the Post of Senior Software Engineer
 *               role:
 *                 type: string
 *                 example: Senior Software Engineer
 *               dateOfJoining:
 *                 type: string
 *                 example: 01 March 2026
 *               compensation:
 *                 type: string
 *                 example: 8,00,000 INR per annum
 *               workLocation:
 *                 type: string
 *                 example: Bangalore
 *               offerDate:
 *                 type: string
 *                 example: 15 February 2026
 *     responses:
 *       200:
 *         description: Offer Letter PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Candidate name is required
 *       500:
 *         description: Server error while generating offer letter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error generating offer letter by admin.
 */

adminRouter.post('/generateOfferLetterByAdmin', generateOfferLetterByAdminController.generateOfferLetterByAdmin);

export default adminRouter;
