import express, { Router } from 'express';
import getAllEmployeesBySuperadminController from '../controllers/superadmin/getAllEmployeesBySuperadminController';
import getAllOrganisationsBySuperadminController from '../controllers/superadmin/getAllOrganisationsBySuperadminController';
import generateOfferLetterBySuperadminController from '../controllers/superadmin/generateOfferLetterBySuperadminController';

const superadminRouter: Router = express.Router();

/**
 * @swagger
 * /superadmin/getAllEmployeesBySuperadmin/{organizationId}:
 *   get:
 *     summary: Get all employees by Superadmin
 *     description: Fetch all employees belonging to a specific organization.
 *     tags:
 *       - Superadmin
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         description: Organization ID to fetch employees
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched employee list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 superadminEmployeeList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65f123abc123xyz456
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       organization:
 *                         type: string
 *                         example: org123
 *       500:
 *         description: Error while fetching employee details
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
 *                   example: Error fetching employee details
 */
superadminRouter.get('/getAllEmployeesBySuperadmin/:organizationId', getAllEmployeesBySuperadminController.getAllEmployeesBySuperadmin);

/**
 * @swagger
 * /superadmin/getAllOrganisationsBySuperadmin:
 *   get:
 *     summary: Get all organizations by Superadmin
 *     description: Fetches the list of all organizations available in the system.
 *     tags:
 *       - Superadmin
 *     responses:
 *       200:
 *         description: Successfully fetched organizations list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organizations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65f123abc123xyz456
 *                       name:
 *                         type: string
 *                         example: ABC Organization
 *                       email:
 *                         type: string
 *                         example: contact@abc.com
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-03-01T10:00:00.000Z
 *       500:
 *         description: Error while fetching organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error in fetching get organisations by super admin !
 */
superadminRouter.get('/getAllOrganisationsBySuperadmin', getAllOrganisationsBySuperadminController.getAllOrganizationsBySuperadmin);
superadminRouter.post('/generateofferletter', generateOfferLetterBySuperadminController.generateOfferLetterBySuperadmin);
export default superadminRouter;
