import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import addCourseController from '../controllers/contentwriter/addCourseController';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';
import getCourseByIdController from '../controllers/contentwriter/getCourseByIdController';
import addCourseModuleController from '../controllers/contentwriter/addCourseModuleController';
import addTaskController from '../controllers/contentwriter/addTaskController';

const contentwriterRouter: Router = express.Router();

contentwriterRouter.post('/addCourse', validateJWT, addCourseController.addNewCourseController);
contentwriterRouter.get('/getAllCourses', validateJWT, getAllCoursesController.getAllCourses);
contentwriterRouter.get('/getCourseById/:id', validateJWT, getCourseByIdController.getCourseByIdController);
contentwriterRouter.post('/addCourseModule', validateJWT, addCourseModuleController.addNewCourseModuleController);
contentwriterRouter.post('/addCourseTask', validateJWT, addTaskController.addNewCourseTaskController);

export default contentwriterRouter;
