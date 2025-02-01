import express, { Router } from 'express';
import recruiterController from '../controllers/recruiter/manageRecruiterController';
import addCommentByRecruiterController from '../controllers/recruiter/addCommentByRecruiterController';
import updateCompanyByRecruiterController from '../controllers/recruiter/updateCompanyByRecruiterController';
import addTalentPoolCandidatesByRecruiterController from '../controllers/recruiter/addTalentPoolCandidateController'
import commonController from '../controllers/common/commonController';
import validateJWT from '../middlewares/validateJWT';

const recruiterRouter: Router = express.Router();

recruiterRouter.post('/login', commonController.login);
recruiterRouter.get('/getCompanyDetails', recruiterController.getPoolCompanyDetails);
recruiterRouter.get('/getCompanyDetailsByIdByRecruiter/:id', recruiterController.getPoolCompanyDetailsById);
recruiterRouter.post('/addCompanyByRecruiter', recruiterController.addPoolCompany);
recruiterRouter.post('/addCommentByRecruiter', validateJWT, addCommentByRecruiterController.addCommentByRecruiter);
recruiterRouter.post('/updateCompanyByRecruiter', updateCompanyByRecruiterController.updateCompanyByRecruiter);
recruiterRouter.post('/addTalentPoolCandidateToTracker', validateJWT, addTalentPoolCandidatesByRecruiterController.addTalentPoolCandidateByRecruiter);

export default recruiterRouter;
