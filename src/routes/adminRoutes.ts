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

const adminRouter: Router = express.Router();

adminRouter.post('/login', commonController.login);
adminRouter.post('/registerEmployeeByAdmin', validateJWT, registerEmployeeByAdminController.register);
adminRouter.get('/getEmployeeDetailsByAdmin/:id', getEmployeeDetailsByAdminController.getUserDetails);
adminRouter.put('/updateEmployeeDetailsByAdmin', validateProfileRequest(userSchema), updateEmployeeDetailsByAdminController.updateProfile);
adminRouter.get('/getAllEmployeeDetailsByAdmin', validateJWT, getAllEmployeeDetailsByAdminController.getAllEmployeeDetails);
adminRouter.post('/employeePasswordResetByAdmin', employeePasswordResetByAdminController.employeePasswordResetByAdmin);
adminRouter.get('/getAllBloodGroupsByAdmin', validateJWT, getAllBloodGroupsByAdminController.getAllBloodGroupsDetails);
adminRouter.post('/addBloodGroupByAdmin', validateJWT, addBloodGroupByAdminController.addNewBloodgroupByAdmin);
adminRouter.post('/deleteEmployeeByAdmin', validateJWT, deleteEmployeeDetailsByAdminController.deleteProfile);
adminRouter.delete('/deleteBloodGroupByAdmin/:id', validateJWT, deleteBloodGroupByAdminController.deleteBloodGroup);
adminRouter.put('/updateBloodGroupByAdmin', updateBloodGroupByAdminController.updateBloodGroup);



export default adminRouter;
