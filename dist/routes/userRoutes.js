"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const getUserOpenRouterKeyController_1 = __importDefault(require("../controllers/useropenrouter/getUserOpenRouterKeyController"));
const validateAndSaveOpenRouterKeyController_1 = __importDefault(require("../controllers/useropenrouter/validateAndSaveOpenRouterKeyController"));
const userOpenRouter = express_1.default.Router();
/**
 * @swagger
 * /user/getuseropenrouterkey:
 *   get:
 *     summary: Get OpenRouter key of the authenticated user
 *     tags:
 *      - UserOpenRouter
 *     security:
 *       - BearerAuth: []
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
 *                   example: User ID is required.
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
userOpenRouter.get('/getuseropenrouterkey', validateJWT_1.default, getUserOpenRouterKeyController_1.default.getUserOpenRouterKey);
/**
 * @swagger
 * /user/validateandsaveopenrouterapikey:
 *   post:
 *     summary: Validate and save the OpenRouter API key of the authenticated user
 *     description: Validates the user-provided OpenRouter API key against the OpenRouter API. If valid, the key is saved for the authenticated user. The user ID is retrieved from the JWT token.
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
 *       200:
 *         description: OpenRouter key is valid and saved successfully
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
 *                   example: Key is Valid and saved successfully !
 *       400:
 *         description: OpenRouter key is missing or invalid
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
 *                   example: Invalid Key !
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
 *                   example: User ID is required.
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
 *                   example: error occurred while adding OpenRouter key, Please try again !
 */
userOpenRouter.post('/validateandsaveopenrouterapikey', validateJWT_1.default, validateAndSaveOpenRouterKeyController_1.default.validateAndSaveOpenRouterKeyController);
exports.default = userOpenRouter;
