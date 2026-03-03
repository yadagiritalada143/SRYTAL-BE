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
/**
 * @swagger
 * /recruiter/addTalentPoolCandidateToTracker:
 *   post:
 *     summary: Add a candidate to Talent Pool Tracker
 *     description: Recruiter adds a candidate to the talent pool tracker.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateName
 *               - contact
 *               - comments
 *             properties:
 *               candidateName:
 *                 type: string
 *                 example: janu
 *               contact:
 *                 type: object
 *                 required:
 *                   - email
 *                   - phone
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: janu@example.com
 *                   phone:
 *                     type: string
 *                     example: "9020888102"
 *               totalYearsOfExperience:
 *                 type: number
 *                 format: float
 *                 example: 3.7
 *               relaventYearsOfExperience:
 *                 type: number
 *                 format: float
 *                 example: 3.2
 *               evaluatedSkills:
 *                 type: string
 *                 example: "C++, cpp, Java react"
 *               comments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - comment
 *                     - callStartsAt
 *                     - callEndsAt
 *                   properties:
 *                     comment:
 *                       type: string
 *                       example: This is for testing
 *                     callStartsAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-02T11:30:04.642Z
 *                     callEndsAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-02T12:30:04.642Z
 *                     isResumeWithDetailsUpload:
 *                       type: boolean
 *                       example: true
 *                     isResumeWithoutDetailsUpload:
 *                      type: boolean
 *                      example: false
 *     responses:
 *       200:
 *         description: Candidate added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 responseAfterCandidateAdded:
 *                   type: object
 *       500:
 *         description: Error while adding candidate to talent pool tracker
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error adding pool candidate details
 */
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
/**
 * @swagger
 * /recruiter/getTalentPoolCandidateById/{id}:
 *   get:
 *     summary: Get Talent Pool Candidate Details By ID
 *     description: Fetch a specific talent pool candidate details including sorted comments (latest first). Requires JWT authentication.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the talent pool candidate
 *         example: 65f1c2e8a1234567890abcd1
 *     responses:
 *       200:
 *         description: Candidate details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 talentPoolCandidateDetails:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 65f1c2e8a1234567890abcd1
 *                     candidateName:
 *                       type: string
 *                       example: janu
 *                     contact:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: janu@example.com
 *                         phone:
 *                           type: string
 *                           example: "9010999102"
 *                     totalYearsOfExperience:
 *                       type: number
 *                       format: float
 *                       example: 3.7
 *                     relaventYearsOfExperience:
 *                       type: number
 *                       format: float
 *                       example: 3.2
 *                     evaluatedSkills:
 *                       type: string
 *                       example: "C++, Java, React"
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           comment:
 *                             type: string
 *                             example: This is for testing
 *                           callStartsAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-11-10T08:00:04.642Z
 *                           callEndsAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-11-10T08:30:04.642Z
 *                           updateAt:
 *                             type: number
 *                             description: Timestamp in milliseconds (sorted descending)
 *                             example: 1762761600000
 *                           userId:
 *                             type: object
 *                             description: Populated recruiter details
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                                 example: John
 *                               lastName:
 *                                 type: string
 *                                 example: Doe
 *       500:
 *         description: Error while fetching candidate details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching pool candidate details
 */
recruiterRouter.get('/getTalentPoolCandidateById/:id', validateJWT_1.default, getTalentPoolCandidateDetailsController_1.default.getTalentPoolCandidateDetailsByRecruiter);
/**
 * @swagger
 * /recruiter/addCommentToTalentPoolCandidate:
 *   post:
 *     summary: Add Comment to Talent Pool Candidate
 *     description: Recruiter adds a new comment to an existing talent pool candidate. The latest comments are returned sorted by updateAt (descending). Requires JWT authentication.
 *     tags:
 *       - Recruiter
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - comment
 *               - callStartsAt
 *               - callEndsAt
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB ObjectId of the talent pool candidate
 *                 example: 65f1c2e8a1234567890abcd1
 *               comment:
 *                 type: string
 *                 example: Candidate performed well in technical discussion
 *               callStartsAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-03-02T10:00:00.000Z
 *               callEndsAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-03-02T10:30:00.000Z
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 responseAfterCommentAdded:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     candidateName:
 *                       type: string
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           comment:
 *                             type: string
 *                             example: Candidate performed well in technical discussion
 *                           callStartsAt:
 *                             type: string
 *                             format: date-time
 *                           callEndsAt:
 *                             type: string
 *                             format: date-time
 *                           updateAt:
 *                             type: string
 *                             format: date-time
 *                           userId:
 *                             type: object
 *                             description: Populated recruiter details
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                                 example: John
 *                               lastName:
 *                                 type: string
 *                                 example: Doe
 *       500:
 *         description: Error while adding comment to talent pool candidate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error adding comment to pool candidate
 */
recruiterRouter.post('/addCommentToTalentPoolCandidate', validateJWT_1.default, addCommentToPoolCandidateByRecruiterController_1.default.addCommentToPoolCandidateByRecruiter);
/**
 * @swagger
 * /recruiter/updatePoolCandidateByRecruiter:
 *   post:
 *     tags:
 *       - Recruiter
 *     summary: Update a pool candidate's details by recruiter
 *     description: This endpoint allows a recruiter to update the details of a talent pool candidate.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - candidateName
 *               - contact
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier of the pool candidate
 *                 example: "67bc100d4b1a1a60c257c091"
 *               candidateName:
 *                 type: string
 *                 description: Candidate's name (mandatory)
 *                 example: "veha"
 *               contact:
 *                 type: object
 *                 required:
 *                   - email
 *                   - phone
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Candidate's email address (unique & mandatory)
 *                     example: "vedha@example.com"
 *                   phone:
 *                     type: string
 *                     description: Candidate's phone number (unique & mandatory)
 *                     example: "9876567898"
 *               totalYearsOfExperience:
 *                 type: number
 *                 description: Candidate's total years of experience
 *                 example: 10.5
 *               relaventYearsOfExperience:
 *                 type: number
 *                 description: Candidate's relevant years of experience
 *                 example: 5.7
 *               evaluatedSkills:
 *                 type: string
 *                 description: Skills evaluated for the candidate
 *                 example: "C, cpp, Java, javascript"
 *     responses:
 *       200:
 *         description: Pool candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Error updating pool candidate details (unauthorized or invalid data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error updating pool candidate details"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error updating pool candidate details"
 */
recruiterRouter.post('/updatePoolCandidateByRecruiter', validateJWT_1.default, updatePoolCandidateByRecruiterController_1.default.updatePoolCandidateByRecruiter);
exports.default = recruiterRouter;
