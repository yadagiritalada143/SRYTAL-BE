import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';

const contentwriterRouter: Router = express.Router();

contentwriterRouter.get('/getAllCourses',validateJWT, getAllCoursesController.getAllCourses);

export default contentwriterRouter;
