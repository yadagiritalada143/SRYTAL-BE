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
recruiterRouter.get('/getCompanyDetails', manageRecruiterController_1.default.getPoolCompanyDetails);
recruiterRouter.get('/getCompanyDetailsByIdByRecruiter/:id', manageRecruiterController_1.default.getPoolCompanyDetailsById);
recruiterRouter.post('/addCompanyByRecruiter', manageRecruiterController_1.default.addPoolCompany);
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
recruiterRouter.post('/updateCompanyByRecruiter', updateCompanyByRecruiterController_1.default.updateCompanyByRecruiter);
recruiterRouter.post('/addTalentPoolCandidateToTracker', validateJWT_1.default, addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter);
recruiterRouter.get('/getAllTalentPoolCandidates', validateJWT_1.default, getAllTalentPoolCandidatesController_1.default.getAllTalentPoolCandidatesByRecruiter);
recruiterRouter.get('/getTalentPoolCandidateById/:id', validateJWT_1.default, getTalentPoolCandidateDetailsController_1.default.getTalentPoolCandidateDetailsByRecruiter);
recruiterRouter.post('/addCommentToTalentPoolCandidate', validateJWT_1.default, addCommentToPoolCandidateByRecruiterController_1.default.addCommentToPoolCandidateByRecruiter);
recruiterRouter.post('/updatePoolCandidateByRecruiter', validateJWT_1.default, updatePoolCandidateByRecruiterController_1.default.updatePoolCandidateByRecruiter);
exports.default = recruiterRouter;
