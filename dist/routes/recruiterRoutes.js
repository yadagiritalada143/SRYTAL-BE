"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const manageRecruiterController_1 = __importDefault(require("../controllers/recruiter/manageRecruiterController"));
const addCommentByRecruiterController_1 = __importDefault(require("../controllers/recruiter/addCommentByRecruiterController"));
const updateCompanyByRecruiterController_1 = __importDefault(require("../controllers/recruiter/updateCompanyByRecruiterController"));
const addTalentPoolCandidateController_1 = __importDefault(require("../controllers/recruiter/addTalentPoolCandidateController"));
const getAllTalentPoolCandidatesController_1 = __importDefault(require("../controllers/recruiter/getAllTalentPoolCandidatesController"));
const getTalentPoolCandidateDetailsController_1 = __importDefault(require("../controllers/recruiter/getTalentPoolCandidateDetailsController"));
const addCommentToPoolCandidateByRecruiterController_1 = __importDefault(require("../controllers/recruiter/addCommentToPoolCandidateByRecruiterController"));
const updatePoolCandidateByRecruiterController_1 = __importDefault(require("../controllers/recruiter/updatePoolCandidateByRecruiterController"));
const commonController_1 = __importDefault(require("../controllers/common/commonController"));
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const recruiterRouter = express_1.default.Router();
recruiterRouter.post('/login', commonController_1.default.login);
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
recruiterRouter.get('/getCompanyDetails', manageRecruiterController_1.default.getPoolCompanyDetails);
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
recruiterRouter.get('/getCompanyDetailsByIdByRecruiter/:id', manageRecruiterController_1.default.getPoolCompanyDetailsById);
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
recruiterRouter.post('/addCompanyByRecruiter', manageRecruiterController_1.default.addPoolCompany);
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
recruiterRouter.post('/addCommentByRecruiter', validateJWT_1.default, addCommentByRecruiterController_1.default.addCommentByRecruiter);
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
recruiterRouter.post('/updateCompanyByRecruiter', updateCompanyByRecruiterController_1.default.updateCompanyByRecruiter);
recruiterRouter.post('/addTalentPoolCandidateToTracker', validateJWT_1.default, addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter);
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
recruiterRouter.get('/getAllTalentPoolCandidates', validateJWT_1.default, getAllTalentPoolCandidatesController_1.default.getAllTalentPoolCandidatesByRecruiter);
recruiterRouter.get('/getTalentPoolCandidateById/:id', validateJWT_1.default, getTalentPoolCandidateDetailsController_1.default.getTalentPoolCandidateDetailsByRecruiter);
recruiterRouter.post('/addCommentToTalentPoolCandidate', validateJWT_1.default, addCommentToPoolCandidateByRecruiterController_1.default.addCommentToPoolCandidateByRecruiter);
recruiterRouter.post('/updatePoolCandidateByRecruiter', validateJWT_1.default, updatePoolCandidateByRecruiterController_1.default.updatePoolCandidateByRecruiter);
exports.default = recruiterRouter;
