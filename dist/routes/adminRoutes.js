"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registrationController_1 = __importDefault(require("../controllers/admin/registrationController"));
const getEmployeeDetailsByAdminController_1 = __importDefault(require("../controllers/admin/getEmployeeDetailsByAdminController"));
const updateEmployeeDetailsByAdminController_1 = __importDefault(require("../controllers/admin/updateEmployeeDetailsByAdminController"));
const commonController_1 = __importDefault(require("../controllers/common/commonController"));
const userSchema_1 = __importDefault(require("../middlewares/schemas/userSchema"));
const validateProfileUpdate_1 = __importDefault(require("../middlewares/validateProfileUpdate"));
const getAllEmployeeDetailsByAdminController_1 = __importDefault(require("../controllers/admin/getAllEmployeeDetailsByAdminController"));
const employeePasswordResetByAdminController_1 = __importDefault(require("../controllers/admin/employeePasswordResetByAdminController"));
const getAllBloodGroupsByAdminController_1 = __importDefault(require("../controllers/admin/getAllBloodGroupsByAdminController"));
const addBloodGroupByAdminController_1 = __importDefault(require("../controllers/admin/addBloodGroupByAdminController"));
const deleteEmployeeDetailsByAdminController_1 = __importDefault(require("../controllers/admin/deleteEmployeeDetailsByAdminController"));
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const deleteBloodGroupByAdminController_1 = __importDefault(require("../controllers/admin/deleteBloodGroupByAdminController"));
const updateBloodGroupByAdminController_1 = __importDefault(require("../controllers/admin/updateBloodGroupByAdminController"));
const addEmploymentTypeByAdminController_1 = __importDefault(require("../controllers/admin/addEmploymentTypeByAdminController"));
const getAllEmploymentTypesByAdminController_1 = __importDefault(require("../controllers/admin/getAllEmploymentTypesByAdminController"));
const updateEmploymentTypeByAdminController_1 = __importDefault(require("../controllers/admin/updateEmploymentTypeByAdminController"));
const deleteEmploymentTypeByAdminController_1 = __importDefault(require("../controllers/admin/deleteEmploymentTypeByAdminController"));
const addEmployeeRoleByAdminController_1 = __importDefault(require("../controllers/admin/addEmployeeRoleByAdminController"));
const getAllEmployeeRoleByAdminController_1 = __importDefault(require("../controllers/admin/getAllEmployeeRoleByAdminController"));
const updateEmployeeRoleByAdminController_1 = __importDefault(require("../controllers/admin/updateEmployeeRoleByAdminController"));
const deleteEmployeeRoleByAdminController_1 = __importDefault(require("../controllers/admin/deleteEmployeeRoleByAdminController"));
const deletePoolCandidatesByAdminController_1 = __importDefault(require("../controllers/admin/deletePoolCandidatesByAdminController"));
const deletePoolCompanyByAdminController_1 = __importDefault(require("../controllers/admin/deletePoolCompanyByAdminController"));
const addPackageByAdminController_1 = __importDefault(require("../controllers/admin/addPackageByAdminController"));
const getAllPackagesByAdminController_1 = __importDefault(require("../controllers/admin/getAllPackagesByAdminController"));
const getPackageDetailsByAdminController_1 = __importDefault(require("../controllers/admin/getPackageDetailsByAdminController"));
const deletePackageByAdminController_1 = __importDefault(require("../controllers/admin/deletePackageByAdminController"));
const updatePackageByAdminController_1 = __importDefault(require("../controllers/admin/updatePackageByAdminController"));
const addTaskByAdminController_1 = __importDefault(require("../controllers/admin/addTaskByAdminController"));
const updateTaskByAdminController_1 = __importDefault(require("../controllers/admin/updateTaskByAdminController"));
const deleteTaskByAdminController_1 = __importDefault(require("../controllers/admin/deleteTaskByAdminController"));
const addPackageToEmployeeByAdminController_1 = __importDefault(require("../controllers/admin/addPackageToEmployeeByAdminController"));
const getEmployeePackagesByAdminController_1 = __importDefault(require("../controllers/admin/getEmployeePackagesByAdminController"));
const deleteEmployeePackagesByAdminController_1 = __importDefault(require("../controllers/admin/deleteEmployeePackagesByAdminController"));
const deleteEmployeeTaskByAdminController_1 = __importDefault(require("../controllers/admin/deleteEmployeeTaskByAdminController"));
const generateSalarySlipByAdminController_1 = __importDefault(require("../controllers/admin/generateSalarySlipByAdminController"));
const validateRegistrationSchema_1 = __importDefault(require("../middlewares/validateRegistrationSchema"));
const registrationSchema_1 = __importDefault(require("../middlewares/schemas/registrationSchema"));
const addFeedbackAttributeByAdminController_1 = __importDefault(require("../controllers/admin/addFeedbackAttributeByAdminController"));
const updateFeedbackAttributeByAdminController_1 = __importDefault(require("../controllers/admin/updateFeedbackAttributeByAdminController"));
const getFeedbackAttributeByAdminController_1 = __importDefault(require("../controllers/admin/getFeedbackAttributeByAdminController"));
const getAllFeedbackAttributeByAdminController_1 = __importDefault(require("../controllers/admin/getAllFeedbackAttributeByAdminController"));
const deleteFeedbackAttributeByAdminController_1 = __importDefault(require("../controllers/admin/deleteFeedbackAttributeByAdminController"));
const addDepartmentByAdminController_1 = __importDefault(require("../controllers/admin/addDepartmentByAdminController"));
const getAllDepartmentByAdminController_1 = __importDefault(require("../controllers/admin/getAllDepartmentByAdminController"));
const getDepartmentByAdminController_1 = __importDefault(require("../controllers/admin/getDepartmentByAdminController"));
const adminRouter = express_1.default.Router();
adminRouter.post('/login', commonController_1.default.login);
adminRouter.get('/refreshToken', commonController_1.default.refreshToken);
adminRouter.get('/logout', validateJWT_1.default, commonController_1.default.logout);
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
adminRouter.post('/registerEmployeeByAdmin', validateJWT_1.default, (0, validateRegistrationSchema_1.default)(registrationSchema_1.default), registrationController_1.default.register);
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
 *         description: Employee details fetched successfully !!
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
 *                       example: "10-Mar-1990"
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
 *                     dateOfJoining:
 *                      type: string
 *                      format: date
 *                      example: "15-Jan-2020"
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
adminRouter.get('/getEmployeeDetailsByAdmin/:id', validateJWT_1.default, getEmployeeDetailsByAdminController_1.default.getUserDetails);
/**
 * @swagger
 * /admin/updateEmployeeDetailsByAdmin:
 *   put:
 *     summary: Update employee profile by admin
 *     description: Updates employee profile fields using employee email as identifier.
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the employee to update
 *                 example: employee@example.com
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               bloodGroup:
 *                 type: string
 *                 description: ObjectId reference of Bloodgroup document
 *                 example: 65f1c2e8a1234567890abcd1
 *               bankDetailsInfo:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                     example: State Bank of India
 *                   accountHolderName:
 *                     type: string
 *                     example: John Doe
 *                   accountNumber:
 *                     type: string
 *                     example: "1234567890"
 *                   ifscCode:
 *                     type: string
 *                     example: SBIN0001234
 *               employmentType:
 *                 type: string
 *                 description: ObjectId reference of Employmenttype document
 *                 example: 65f1c2e8a1234567890abcd2
 *               employeeRole:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of ObjectId references of Employeerole documents
 *                 example:
 *                   - 65f1c2e8a1234567890abcd3
 *                   - 65f1c2e8a1234567890abcd4
 *               employeeId:
 *                 type: string
 *                 example: EMP001
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 10-Mar-1990
 *               aadharNumber:
 *                 type: string
 *                 example: "123412341234"
 *               panCardNumber:
 *                 type: string
 *                 example: ABCDE1234F
 *               dateOfJoining:
 *                type: string
 *                format: date
 *                example: 15-Jan-2020
 *               uanNumber:
 *                 type: string
 *                 example: "123456789012345"
 *               department:
 *                 type: string
 *                 description: ObjectId reference of Department document
 *                 example: 65f1c2e8a1234567890abcd5
 *               presentAddress:
 *                 type: string
 *                 example: 123 Street, City, State
 *               permanentAddress:
 *                 type: string
 *                 example: 456 Street, City, State
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Employee profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing JWT
 *       500:
 *         description: Internal server error
 */
adminRouter.put('/updateEmployeeDetailsByAdmin', (0, validateProfileUpdate_1.default)(userSchema_1.default), validateJWT_1.default, updateEmployeeDetailsByAdminController_1.default.updateProfile);
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
 *         description: Employee details fetched successfully !!
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
adminRouter.get('/getAllEmployeeDetailsByAdmin', validateJWT_1.default, getAllEmployeeDetailsByAdminController_1.default.getAllEmployeeDetails);
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
adminRouter.post('/employeePasswordResetByAdmin', employeePasswordResetByAdminController_1.default.employeePasswordResetByAdmin);
/**
 * @swagger
 * /admin/getAllBloodGroupsByAdmin:
 *   get:
 *     summary: Get all blood groups
 *     description: Fetch all blood group details available in the system (Admin access).
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Blood group list fetched successfully !!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bloodGroupList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f8a1b2c12345abcd678901"
 *                       bloodGroup:
 *                         type: string
 *                         example: "A+"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-10T10:30:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-10T10:30:00.000Z"
 *       500:
 *         description: Error while fetching blood group details
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
 *                   example: Error in fetching blood group details
 */
adminRouter.get('/getAllBloodGroupsByAdmin', validateJWT_1.default, getAllBloodGroupsByAdminController_1.default.getAllBloodGroupsDetails);
adminRouter.post('/addBloodGroupByAdmin', validateJWT_1.default, addBloodGroupByAdminController_1.default.addNewBloodgroupByAdmin);
adminRouter.post('/deleteEmployeeByAdmin', validateJWT_1.default, deleteEmployeeDetailsByAdminController_1.default.deleteProfile);
adminRouter.delete('/deleteBloodGroupByAdmin/:id', validateJWT_1.default, deleteBloodGroupByAdminController_1.default.deleteBloodGroup);
adminRouter.put('/updateBloodGroupByAdmin', validateJWT_1.default, updateBloodGroupByAdminController_1.default.updateBloodGroup);
adminRouter.post('/addEmploymentTypeByAdmin', validateJWT_1.default, addEmploymentTypeByAdminController_1.default.addEmploymentTypeByAdmin);
adminRouter.get('/getallEmploymentTypesByAdmin', validateJWT_1.default, getAllEmploymentTypesByAdminController_1.default.getAllEmploymentTypesByAdmin);
adminRouter.put('/updateEmploymentTypeByAdmin', validateJWT_1.default, updateEmploymentTypeByAdminController_1.default.updateEmploymentType);
adminRouter.delete('/deleteEmploymentTypeByAdmin/:id', validateJWT_1.default, deleteEmploymentTypeByAdminController_1.default.deleteEmploymentType);
adminRouter.post('/addEmployeeRoleByAdmin', validateJWT_1.default, addEmployeeRoleByAdminController_1.default.addEmployeeRoleByAdmin);
adminRouter.get('/getAllEmployeeRoleByAdmin', validateJWT_1.default, getAllEmployeeRoleByAdminController_1.default.getAllEmployeeRolesByAdmin);
adminRouter.put('/updateEmployeeRoleByAdmin', validateJWT_1.default, updateEmployeeRoleByAdminController_1.default.updateEmployeeRole);
adminRouter.delete('/deleteEmployeeRoleByAdmin/:id', validateJWT_1.default, deleteEmployeeRoleByAdminController_1.default.deleteEmployeeRole);
adminRouter.delete('/deletePoolCandidatesByAdmin/:id', validateJWT_1.default, deletePoolCandidatesByAdminController_1.default.deletePoolCandidateByAdmin);
adminRouter.delete('/deletePoolCompanyByAdmin/:id', validateJWT_1.default, deletePoolCompanyByAdminController_1.default.deletePoolCompanyByAdmin);
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
adminRouter.post('/addPackageByAdmin', validateJWT_1.default, addPackageByAdminController_1.default.addPackageByAdminController);
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
adminRouter.get('/getAllPackagesByAdmin', validateJWT_1.default, getAllPackagesByAdminController_1.default.getAllPackagesDetails);
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
adminRouter.get('/getPackageDetailsByAdmin/:id', validateJWT_1.default, getPackageDetailsByAdminController_1.default.getPackageDetailsByAdmin);
/**
 * @swagger
 * /admin/deletePackageByAdmin/{id}:
 *   delete:
 *     summary: Delete Package by Admin
 *     description: |
 *       Deletes a package by Admin.
 *       - If `confirmDelete` is true → Hard delete (permanently removes package).
 *       - If `confirmDelete` is false → Soft delete (sets isDeleted to true).
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Package ID to delete
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmDelete:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - confirmDelete
 *     responses:
 *       200:
 *         description: Package deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error while deleting package
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
 *                   example: Error deleting package
 */
adminRouter.delete('/deletePackageByAdmin/:id', validateJWT_1.default, deletePackageByAdminController_1.default.deletePackageByAdmin);
/**
 * @swagger
 * /admin/updatePackageByAdmin:
 *   put:
 *     summary: Update Package By Admin
 *     description: Allows an admin to update an existing package using its ID.
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
 *               - id
 *               - detailsToUpdate
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB ObjectId of the package
 *                 example: "67ff51b17ef83b9fefaf6d31"
 *               detailsToUpdate:
 *                 type: object
 *                 description: Fields to update in the package
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Srytal Development Package"
 *                   description:
 *                     type: string
 *                     example: "Comprehensive package for Srytal development projects"
 *                   approvers:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example:
 *                       - "67a7a2e92fe4be54addbd36f"
 *     responses:
 *       200:
 *         description: Package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responseAfterUpdate:
 *                   type: object
 *                   example:
 *                     acknowledged: true
 *                     matchedCount: 1
 *                     modifiedCount: 1
 *       500:
 *         description: Package updating failed
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
 *                   example: Package updating failed
 */
adminRouter.put('/updatePackageByAdmin', validateJWT_1.default, updatePackageByAdminController_1.default.updatePackageByAdminController);
/**
 * @swagger
 * /admin/addTaskByAdmin:
 *   post:
 *     summary: Add Task By Admin
 *     description: Creates a new task and assigns it to a package.
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
 *               - title
 *               - packageId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task
 *                 example: "This is testing add task-ramya-1"
 *               packageId:
 *                 type: string
 *                 description: MongoDB ObjectId of the package
 *                 example: "67ff51d17ef83b9fefaf6d35"
 *               isDeleted:
 *                 type: boolean
 *                 description: Indicates if the task is deleted (will be overridden to false by backend)
 *                 example: false
 *     responses:
 *       200:
 *         description: Task added successfully !!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6801ab23ef83b9fefaf6d999"
 *                 title:
 *                   type: string
 *                   example: "This is testing add task-ramya-1"
 *                 packageId:
 *                   type: string
 *                   example: "67ff51d17ef83b9fefaf6d35"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-03T10:15:30.000Z"
 *                 lastUpdatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-03T10:15:30.000Z"
 *                 createdBy:
 *                   type: string
 *                   example: "67a7a2e92fe4be54addbd36f"
 *                 isDeleted:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Error while adding task
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
 *                   example: Task adding failed
 */
adminRouter.post('/addTaskByAdmin', validateJWT_1.default, addTaskByAdminController_1.default.addTaskByAdminController);
/**
 * @swagger
 * /admin/updateTaskByAdmin:
 *   put:
 *     summary: Update Task By Admin
 *     description: Updates an existing task by its ID.
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
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB ObjectId of the task
 *                 example: "6801ab23ef83b9fefaf6d999"
 *               title:
 *                 type: string
 *                 description: Updated title of the task
 *                 example: "Updated task title"
 *     responses:
 *       200:
 *         description: Task updated successfully !!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responseAfterUpdate:
 *                   type: object
 *                   description: MongoDB update result object
 *                   example:
 *                     acknowledged: true
 *                     matchedCount: 1
 *                     modifiedCount: 1
 *       500:
 *         description: Error while updating task
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
 *                   example: Task updating failed
 */
adminRouter.put('/updateTaskByAdmin', validateJWT_1.default, updateTaskByAdminController_1.default.updateTaskByAdminController);
/**
 * @swagger
 * /admin/deleteTaskByAdmin/{id}:
 *   delete:
 *     summary: Delete Task By Admin
 *     description: |
 *       Deletes a task by ID.
 *       - If `confirmDelete` is true → performs a hard delete (permanent removal).
 *       - If `confirmDelete` is false or not provided → performs a soft delete (sets isDeleted to true).
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
 *         description: MongoDB ObjectId of the task to delete
 *         example: "6801ab23ef83b9fefaf6d999"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmDelete:
 *                 type: boolean
 *                 description: Set to true for permanent deletion, false for soft delete
 *                 example: true
 *     responses:
 *       200:
 *         description: Task deleted successfully (soft or hard)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Error while deleting task
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
 *                   example: Task deletion failed
 */
adminRouter.delete('/deleteTaskByAdmin/:id', validateJWT_1.default, deleteTaskByAdminController_1.default.deleteTaskByAdmin);
/**
 * @swagger
 * /admin/addPackagetoEmployeeByAdmin:
 *   post:
 *     summary: Assign Package to Employee By Admin
 *     description: |
 *       Assigns one or more packages (with tasks) to an employee.
 *       - If assignment already exists, it updates it.
 *       - Otherwise, it creates a new record.
 *       - The backend auto-generates monthly timesheet entries for each task.
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
 *               - packages
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the employee
 *                 example: "67aa1c35a9dcb98f11fc14d3"
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
 *                       description: MongoDB ObjectId of the package
 *                       example: "67ff51d17ef83b9fefaf6d35"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - taskId
 *                         properties:
 *                           taskId:
 *                             type: string
 *                             description: MongoDB ObjectId of the task
 *                             example: "681396d992af6ac8a2a069cc"
 *                           startDate:
 *                             type: string
 *                             format: date
 *                             example: "2025-05-07"
 *                           createdAt:
 *                             type: string
 *                             format: date
 *                             example: "2025-05-10"
 *                           currentMonthLastDay:
 *                             type: string
 *                             example: "Sat May 31 2025"
 *     responses:
 *       200:
 *         description: Package assigned or updated successfully !!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Error while assigning package to employee
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
 *                   example: Error while adding package to employee
 */
adminRouter.post('/addPackagetoEmployeeByAdmin', validateJWT_1.default, addPackageToEmployeeByAdminController_1.default.addPackageToEmployeeByAdmin);
/**
 * @swagger
 * /admin/getEmployeePackagesByAdmin/{employeeId}:
 *   get:
 *     summary: Get Employee Packages By Admin
 *     description: |
 *       Retrieves all packages assigned to a specific employee.
 *       - Populates package details.
 *       - Populates task details.
 *       - Excludes timesheet data from tasks in the response.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the employee
 *         example: "67aa1c35a9dcb98f11fc14d3"
 *     responses:
 *       200:
 *         description: Employee package details fetched successfully !!
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
 *                         example: "6815a3c892af6ac8a2a01000"
 *                       employeeId:
 *                         type: string
 *                         example: "67aa1c35a9dcb98f11fc14d3"
 *                       packages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             packageId:
 *                               type: object
 *                               description: Populated package details
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: "67ff51d17ef83b9fefaf6d35"
 *                                 title:
 *                                   type: string
 *                                   example: "Internal Development Package"
 *                                 description:
 *                                   type: string
 *                                   example: "Handles internal development activities"
 *                             tasks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 description: Populated task details (without timesheet)
 *                                 properties:
 *                                   taskId:
 *                                     type: object
 *                                     properties:
 *                                       _id:
 *                                         type: string
 *                                         example: "681396d992af6ac8a2a069cc"
 *                                       title:
 *                                         type: string
 *                                         example: "Backend API Development"
 *                                   timeSheetStatus:
 *                                     type: string
 *                                     example: "Submitted"
 *                                   startDate:
 *                                     type: string
 *                                     format: date
 *                                     example: "2025-05-07"
 *                                   createdAt:
 *                                     type: string
 *                                     format: date
 *                                     example: "2025-05-10"
 *                                   currentMonthLastDay:
 *                                     type: string
 *                                     example: "Sat May 31 2025"
 *       500:
 *         description: Error while fetching employee package details
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
 *                   example: Error while fetching employee package details
 */
adminRouter.get('/getEmployeePackagesByAdmin/:employeeId', validateJWT_1.default, getEmployeePackagesByAdminController_1.default.getEmployeePackageDetailsByAdmin);
/**
 * @swagger
 * /admin/deleteEmployeePackagesByAdmin:
 *   delete:
 *     summary: Delete Employee Package By Admin
 *     description: |
 *       Removes a specific package assigned to an employee.
 *
 *       - If the employee has multiple packages → only the specified package is removed.
 *       - If it is the last remaining package → the entire employee-package document is deleted.
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
 *               - packageId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the employee
 *                 example: "67aa1c35a9dcb98f11fc14d3"
 *               packageId:
 *                 type: string
 *                 description: MongoDB ObjectId of the package to remove
 *                 example: "67ff51d17ef83b9fefaf6d35"
 *     responses:
 *       200:
 *         description: Employee package deleted successfully !!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responseAfterDelete:
 *                   type: object
 *                   description: Updated document or delete result
 *                   example:
 *                     acknowledged: true
 *                     deletedCount: 1
 *       500:
 *         description: Error while deleting employee package
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
 *                   example: Error while deleting employee package
 */
adminRouter.delete('/deleteEmployeePackagesByAdmin', validateJWT_1.default, deleteEmployeePackagesByAdminController_1.default.deleteEmployeePackageByAdmin);
/**
 * @swagger
 * /admin/deleteEmployeeTaskByAdmin:
 *   delete:
 *     summary: Delete a Task Assigned to an Employee By Admin
 *     description: |
 *       Deletes a specific task from a package assigned to an employee.
 *       - Removes only the specified task from the employee’s package.
 *       - Updates the employee-package document in MongoDB.
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
 *               - packageId
 *               - taskId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the employee
 *                 example: "67aa1c35a9dcb98f11fc14d3"
 *               packageId:
 *                 type: string
 *                 description: MongoDB ObjectId of the package containing the task
 *                 example: "67ff51d17ef83b9fefaf6d35"
 *               taskId:
 *                 type: string
 *                 description: MongoDB ObjectId of the task to delete
 *                 example: "681396d992af6ac8a2a069cc"
 *     responses:
 *       200:
 *         description: Task deleted successfully from employee package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responseAfterDelete:
 *                   type: object
 *                   description: Updated employee-package document after task removal
 *                   example:
 *                     _id: "6815a3c892af6ac8a2a01000"
 *                     employeeId: "67aa1c35a9dcb98f11fc14d3"
 *                     packages:
 *                       - packageId:
 *                           _id: "67ff51d17ef83b9fefaf6d35"
 *                         tasks: []
 *       500:
 *         description: Error while deleting employee task
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
 *                   example: Error while deleting employee task
 */
adminRouter.delete('/deleteEmployeeTaskByAdmin', validateJWT_1.default, deleteEmployeeTaskByAdminController_1.default.deleteEmployeeTaskByAdmin);
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
 *               - _id
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
 *               _id:
 *                 type: string
 *                 description: MongoDB document ID of the employee
 *                 example: "507f1f77bcf86cd799439011"
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
adminRouter.post('/generateSalarySlip', generateSalarySlipByAdminController_1.default.generateSalarySlip);
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
adminRouter.post('/previewSalarySlip', validateJWT_1.default, generateSalarySlipByAdminController_1.default.previewSalarySlip);
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
adminRouter.post('/addfeedbackattributebyadmin', addFeedbackAttributeByAdminController_1.default.addFeedbackAttributeByAdminController);
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
adminRouter.put('/updatefeedbackattributebyadmin', validateJWT_1.default, updateFeedbackAttributeByAdminController_1.default.updateFeedbackAttributeByAdminController);
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
adminRouter.get('/getfeedbackattributebyadmin/:id', validateJWT_1.default, getFeedbackAttributeByAdminController_1.default.getFeedbackAttributeByAdminController);
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
adminRouter.get('/getallfeedbackattributesbyadmin', validateJWT_1.default, getAllFeedbackAttributeByAdminController_1.default.getAllFeedbackAttributesByAdminController);
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
adminRouter.delete('/deletefeedbackattributebyadmin/:id', validateJWT_1.default, deleteFeedbackAttributeByAdminController_1.default.deleteFeedbackAttributeByAdminController);
/**
 * @swagger
 * /admin/adddepartmentbyadmin:
 *   post:
 *     summary: Add a new department by admin
 *     description: This API allows an admin to create a new department in the system.
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
 *               - departmentName
 *             properties:
 *               departmentName:
 *                 type: string
 *                 example: Computer Science
 *     responses:
 *       200:
 *         description: Department added successfully
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
 *                   example: Department added successfully
 *       500:
 *         description: Error while adding department
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
 *                   example: Error while adding department
 */
adminRouter.post('/adddepartmentbyadmin', validateJWT_1.default, addDepartmentByAdminController_1.default.addDepartmentByAdminController);
/**
 * @swagger
 * /admin/getalldepartmentsbyadmin:
 *   get:
 *     summary: Get all departments
 *     description: Fetch all departments available in admin.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Departments fetched successfully
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
 *                   example: Departments fetched successfully !!
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     departmentResponse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 65f2a8c4e8c9f21a34567890
 *                           departmentName:
 *                             type: string
 *                             example: Computer Science
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       500:
 *         description: Internal server error
 */
adminRouter.get('/getalldepartmentsbyadmin', validateJWT_1.default, getAllDepartmentByAdminController_1.default.getAllDepartmentByAdminController);
/**
 * @swagger
 * /admin/getdepartmentbyadmin/{_id}:
 *   get:
 *     summary: Get department by ID
 *     description: Fetch a specific department using its ID (Admin only).
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: MongoDB ID of the department
 *         schema:
 *           type: string
 *           example: 65f2a8c4e8c9f21a34567890
 *     responses:
 *       200:
 *         description: Department fetched successfully !!
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
 *                   example: Department fetched successfully !!
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 65f2a8c4e8c9f21a34567890
 *                     departmentName:
 *                       type: string
 *                       example: Computer Science
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Department not found
 *       401:
 *         description: Unauthorized - JWT token required
 *       500:
 *         description: Internal server error
 */
adminRouter.get('/getdepartmentbyadmin/:_id', validateJWT_1.default, getDepartmentByAdminController_1.default.getDepartmentByAdmin);
exports.default = adminRouter;
