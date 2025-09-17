import express, { Router } from 'express';
import recruiterController from '../controllers/recruiter/manageRecruiterController';
import addCommentByRecruiterController from '../controllers/recruiter/addCommentByRecruiterController';
import updateCompanyByRecruiterController from '../controllers/recruiter/updateCompanyByRecruiterController';
import addTalentPoolCandidatesByRecruiterController from '../controllers/recruiter/addTalentPoolCandidateController';
import getAllTalentPoolCandidatesByRecruiterController from '../controllers/recruiter/getAllTalentPoolCandidatesController';
import getTalentPoolCandidateDetailsController from '../controllers/recruiter/getTalentPoolCandidateDetailsController';
import addCommentToPoolCandidateController from '../controllers/recruiter/addCommentToPoolCandidateByRecruiterController';
import updatePoolCandidateController from '../controllers/recruiter/updatePoolCandidateByRecruiterController';
import commonController from '../controllers/common/commonController';
import validateJWT from '../middlewares/validateJWT';

const recruiterRouter: Router = express.Router();

recruiterRouter.post('/login', commonController.login);
recruiterRouter.get('/getCompanyDetails', recruiterController.getPoolCompanyDetails);
recruiterRouter.get('/getCompanyDetailsByIdByRecruiter/:id', recruiterController.getPoolCompanyDetailsById);
recruiterRouter.post('/addCompanyByRecruiter', recruiterController.addPoolCompany);
recruiterRouter.post('/addCommentByRecruiter', validateJWT, addCommentByRecruiterController.addCommentByRecruiter);

/**
 * @swagger
 * /recruiter/updateCompanyByRecruiter:
 *   post:
 *     summary: Update company details in the talent pool
 *     description: update an existing company's details.
 *     tags:
 *       - Recruiter
 *     security:
 *       - bearerAuth: []  # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - companyName
 *             properties:
 *               id:
 *                 type: string
 *                 description: Id of the company
 *               companyName:
 *                 type: string
 *                 description: Name of the company 
 *               primaryContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *               secondaryContact_1:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *               secondaryContact_2:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

recruiterRouter.post('/updateCompanyByRecruiter', updateCompanyByRecruiterController.updateCompanyByRecruiter);
recruiterRouter.post('/addTalentPoolCandidateToTracker', validateJWT, addTalentPoolCandidatesByRecruiterController.addTalentPoolCandidateByRecruiter);
recruiterRouter.get('/getAllTalentPoolCandidates', validateJWT, getAllTalentPoolCandidatesByRecruiterController.getAllTalentPoolCandidatesByRecruiter);
recruiterRouter.get('/getTalentPoolCandidateById/:id', validateJWT, getTalentPoolCandidateDetailsController.getTalentPoolCandidateDetailsByRecruiter);
recruiterRouter.post('/addCommentToTalentPoolCandidate', validateJWT, addCommentToPoolCandidateController.addCommentToPoolCandidateByRecruiter);
recruiterRouter.post('/updatePoolCandidateByRecruiter', validateJWT, updatePoolCandidateController.updatePoolCandidateByRecruiter);

export default recruiterRouter;
