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

/**
 * @swagger
 * /recruiter/getCompanyDetails:
 *   get:
 *     summary: Get all pool company details
 *     description: a list of all pool companies along with their contact details and status.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []  # JWT Bearer token required
 *     responses:
 *       200:
 *         description: Pool companies fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 poolCompaniesResponse:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       companyName:
 *                         type: string
 *                       primaryContact:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                           phone:
 *                             type: string
 *                       secondaryContact_1:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                           phone:
 *                             type: string
 *                       secondaryContact_2:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                           phone:
 *                             type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       lastUpdatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
recruiterRouter.get('/getCompanyDetails', recruiterController.getPoolCompanyDetails);

/**
 * @swagger
 * /recruiter/getCompanyDetailsByIdByRecruiter/{id}:
 *   get:
 *     summary: Get pool company details by ID
 *     description: Retrieve specific pool company details, including comments and contact info, using the company ID.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []  # JWT Bearer token required
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pool company
 *     responses:
 *       200:
 *         description: Pool company fetched successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
recruiterRouter.get('/getCompanyDetailsByIdByRecruiter/:id', recruiterController.getPoolCompanyDetailsById);

/**
 * @swagger
 * /recruiter/addCompanyByRecruiter:
 *   post:
 *     summary: Add a new pool company
 *     description: Allows a recruiter to add a new pool company along with contact and status details.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []  # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - primaryContact
 *               - status
 *             properties:
 *               companyName:
 *                 type: string
 *               primaryContact:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - phone
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
 *               createdAt:
 *                  type: string
 *                  formate: date-time
 *     responses:
 *       200:
 *         description: Pool company added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal Server Error
 */
recruiterRouter.post('/addCompanyByRecruiter', recruiterController.addPoolCompany);

/**
 * @swagger
 * /recruiter/addCommentByRecruiter:
 *   post:
 *     summary: Add a comment by recruiter
 *     description: Allows a recruiter to add a comment to a candidate’s pool company profile.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []  # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - comment
 *             properties:
 *               id:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 responseAfterCommentAdded:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
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
 *       - BearerAuth: []  # JWT Bearer token required
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
 *       500:
 *         description: Internal server error
 */
recruiterRouter.post('/updateCompanyByRecruiter', updateCompanyByRecruiterController.updateCompanyByRecruiter);
recruiterRouter.post('/addTalentPoolCandidateToTracker', validateJWT, addTalentPoolCandidatesByRecruiterController.addTalentPoolCandidateByRecruiter);

/**
 * @swagger
 * /recruiter/getAllTalentPoolCandidates:
 *   get:
 *     summary: Get all talent pool candidates
 *     description: Fetches a list of all candidates in the talent pool.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []  # JWT Bearer token required
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of talent pool candidates
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       500:
 *         description: Internal server error - Unable to fetch candidate details
 */
recruiterRouter.get('/getAllTalentPoolCandidates', validateJWT, getAllTalentPoolCandidatesByRecruiterController.getAllTalentPoolCandidatesByRecruiter);
recruiterRouter.get('/getTalentPoolCandidateById/:id', validateJWT, getTalentPoolCandidateDetailsController.getTalentPoolCandidateDetailsByRecruiter);
recruiterRouter.post('/addCommentToTalentPoolCandidate', validateJWT, addCommentToPoolCandidateController.addCommentToPoolCandidateByRecruiter);
recruiterRouter.post('/updatePoolCandidateByRecruiter', validateJWT, updatePoolCandidateController.updatePoolCandidateByRecruiter);

export default recruiterRouter;
