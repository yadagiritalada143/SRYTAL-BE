import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';
import addCourseModuleController from '../controllers/contentwriter/addCourseModuleController';

const contentwriterRouter: Router = express.Router();

contentwriterRouter.get('/getAllCourses',validateJWT, getAllCoursesController.getAllCourses);
contentwriterRouter.post('/addNewModule', addCourseModuleController.addNewCourseModuleController)

export default contentwriterRouter;
