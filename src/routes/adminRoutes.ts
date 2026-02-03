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

const adminRouter: Router = express.Router();

adminRouter.post('/login', commonController.login);
adminRouter.get('/refreshToken', commonController.refreshToken);
adminRouter.get('/logout', validateJWT, commonController.logout);
adminRouter.post('/registerEmployeeByAdmin', validateJWT, registerEmployeeByAdminController.register);

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
adminRouter.post('/addPackageByAdmin', validateJWT, addPackageByAdminController.addPackageByAdminController);
adminRouter.get('/getAllPackagesByAdmin', validateJWT, getAllPackagesByAdminController.getAllPackagesDetails);
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

export default adminRouter;
