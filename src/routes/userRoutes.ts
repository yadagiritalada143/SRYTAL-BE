import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import userOpenRouterKeyController from '../controllers/user-router/userOpenRouterKeyController';
import getUserOpenRouterKeyController from '../controllers/user-router/getUserOpenRouterKeyController';

const userOpenRouter: Router = express.Router();


/**
 * @swagger
 * /user/UserOpenRouterKey:
 *   post:
 *     summary: Save user OpenRouter API key
 *     description: Saves the OpenRouter API key for the authenticated user. The user ID is retrieved from the JWT token and does not need to be provided in the request body.
 *     tags:
 *       - UserOpenRouter
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - openrouterKey
 *             properties:
 *               openrouterKey:
 *                 type: string
 *                 description: OpenRouter API key of the authenticated user
 *                 example: sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
 *     responses:
 *       201:
 *         description: User OpenRouter key added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User OpenRouter key added successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68c123456789abcdef123456
 *                     userId:
 *                       type: string
 *                       example: 68b123456789abcdef123456
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *
 *       400:
 *         description: OpenRouter key is missing
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
 *                   example: OpenRouter key is required.
 *
 *       401:
 *         description: User ID was not found in JWT token
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
 *                   example: User ID not found.
 *
 *       404:
 *         description: User not found
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
 *                   example: User not found.
 *
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
 *                   example: Internal server error.
 */

userOpenRouter.post('/UserOpenRouterKey', validateJWT, userOpenRouterKeyController.userOpenRouterKey);

/**
 * @swagger
 * /user/getUserOpenRouterKey/{id}:
 *   get:
 *     summary: Get OpenRouter key for a user by user ID
 *     tags: 
 *      - UserOpenRouter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose OpenRouter key needs to be fetched
 *         example: 68b123456789abcdef123456
 *     responses:
 *       200:
 *         description: OpenRouter key fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OpenRouter key fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68c123456789abcdef123456
 *                     userId:
 *                       type: string
 *                       example: 68b123456789abcdef123456
 *                     openrouterKey:
 *                       type: string
 *                       example: sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-07T13:30:00.000Z
 *
 *       400:
 *         description: User ID is missing
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
 *                   example: User ID is required.
 *
 *       401:
 *         description: User ID was not found in JWT token
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
 *                   example: User ID not found.
 *
 *       404:
 *         description: User or OpenRouter key not found
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
 *                   example: OpenRouter key not found for this user.
 *
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
 *                   example: error occurred while fetching OpenRouter key, Please try again !
 */

userOpenRouter.get('/getUserOpenRouterKey/:id', validateJWT, getUserOpenRouterKeyController.getUserOpenRouterKey);

export default userOpenRouter;
