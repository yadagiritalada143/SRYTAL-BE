import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';
import getCourseByIdController from '../controllers/contentwriter/getCourseByIdController';
import addCourseModuleController from '../controllers/contentwriter/addCourseModuleController';

const contentwriterRouter: Router = express.Router();

contentwriterRouter.get('/getAllCourses', validateJWT, getAllCoursesController.getAllCourses);
contentwriterRouter.get('/getCourseById/:id', validateJWT, getCourseByIdController.getCourseByIdController)
contentwriterRouter.post('/addCourseModule', validateJWT, addCourseModuleController.addNewCourseModuleController)

export default contentwriterRouter;
