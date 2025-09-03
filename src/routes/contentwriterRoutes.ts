import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import addCourseController from '../controllers/contentwriter/addCourseController';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';
import getCourseDetailsByIdController from '../controllers/contentwriter/getCourseByIdController';
import addCourseModuleController from '../controllers/contentwriter/addCourseModuleController';
import addCourseTaskController from '../controllers/contentwriter/addCourseTaskController';

const contentwriterRouter: Router = express.Router();

contentwriterRouter.post('/addCourse', validateJWT, addCourseController.addNewCourse);
contentwriterRouter.get('/getAllCourses', validateJWT, getAllCoursesController.getAllCourses);
contentwriterRouter.get('/getCourseById/:id', validateJWT, getCourseDetailsByIdController.getCourseDetailsById);
contentwriterRouter.post('/addCourseModule', validateJWT, addCourseModuleController.addModuleToCourse);
contentwriterRouter.post('/addCourseTask', validateJWT, addCourseTaskController.addTaskToModule);

export default contentwriterRouter;
