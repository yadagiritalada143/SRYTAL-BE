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


const adminRouter: Router = express.Router();

adminRouter.post('/login', commonController.login);
adminRouter.post('/registerEmployeeByAdmin', validateJWT, registerEmployeeByAdminController.register);
adminRouter.get('/getEmployeeDetailsByAdmin/:id', validateJWT, getEmployeeDetailsByAdminController.getUserDetails);
adminRouter.put('/updateEmployeeDetailsByAdmin', validateProfileRequest(userSchema), validateJWT, updateEmployeeDetailsByAdminController.updateProfile);
adminRouter.get('/getAllEmployeeDetailsByAdmin', validateJWT, getAllEmployeeDetailsByAdminController.getAllEmployeeDetails);
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
adminRouter.delete('/deletePoolCandidatesByAdmin/:id',validateJWT, deletePoolCandidateByadminController.deletePoolCandidateByAdmin)

export default adminRouter;
