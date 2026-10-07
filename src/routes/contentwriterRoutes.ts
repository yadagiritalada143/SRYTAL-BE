import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import validateJWTForMedia from '../middlewares/validateJWTForMedia';
import addCourseController from '../controllers/contentwriter/addCourseController';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';
import getCourseDetailsByIdController from '../controllers/contentwriter/getCourseByIdController';
import addCourseModuleController from '../controllers/contentwriter/addCourseModuleController';
import addCourseTaskController from '../controllers/contentwriter/addCourseTaskController';
import getCourseTaskContentController from '../controllers/contentwriter/getCourseTaskContentController';
import updateCourseTaskController from '../controllers/contentwriter/updateCourseTaskController';
import addCourseTaskQuestionController from '../controllers/contentwriter/addCourseTaskQuestionController';
import updateCourseTaskQuestionController from '../controllers/contentwriter/updateCourseTaskQuestionController';
import deleteCourseTaskQuestionController from '../controllers/contentwriter/deleteCourseTaskQuestionController';
import getCourseTaskQuestionsController from '../controllers/contentwriter/getCourseTaskQuestionsController';
import validateRegistrationSchema from '../middlewares/validateRegistrationSchema';
import validateParamsSchema from '../middlewares/validateParamsSchema';
import {
    addCourseTaskQuestionSchema,
    updateCourseTaskQuestionSchema,
    courseTaskIdParamsSchema,
    courseTaskQuestionIdParamsSchema
} from '../middlewares/schemas/courseTaskQuestionSchema';
import updateCourseModuleController from '../controllers/contentwriter/updateCourseModuleController';
import updateCourseController from '../controllers/contentwriter/updateCourseController';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

upload.fields([{name: 'taskFile', maxCount: 1,},{ name: 'thumbnailFile', maxCount: 1,}]);

const contentwriterRouter: Router = express.Router();

/**
 * @swagger
 * /contentwriter/getAllCourses:
 *   get:
 *     summary: Get all courses
 *     description: Get all courses with their thumbnail image URLs, plus aggregate totals of courses, modules, and tasks.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f123456789abcdef123456"
 *                       courseName:
 *                         type: string
 *                         example: "Node.js"
 *                       courseDescription:
 *                         type: string
 *                         example: "Complete Node.js Backend Development Course"
 *                       thumbnail:
 *                         type: string
 *                         example: "LMSData/Courses/CourseThumbnails/836c5b10-8152-482e-beb3-632abf62464d.png"
 *                       thumbnailUrl:
 *                         type: string
 *                         format: uri
 *                         example: "https://your-bucket.s3.amazonaws.com/LMSData/Courses/CourseThumbnails/836c5b10-8152-482e-beb3-632abf62464d.png"
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error.
 */
contentwriterRouter.get('/getAllCourses', validateJWT, getAllCoursesController.getAllCourses);

/**
 * @swagger
 * /contentwriter/getCourseById/{id}:
 *   get:
 *     summary: Get course by ID
 *     description: Retrieve details of a single course, including its modules, by course ID.
 *     tags:
 *       - ContentWriter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to retrieve
 *     security:
 *       - BearerAuth: [] # JWT Bearer token required
 *     responses:
 *       200:
 *         description: Successfully retrieved the course.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courseName:
 *                   type: string
 *                 courseDescription:
 *                   type: string
 *                 modules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       moduleName:
 *                         type: string
 *                       moduleDescription:
 *                         type: string
 *                       courseId:
 *                         type: string
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error
 */
contentwriterRouter.get('/getCourseById/:id', validateJWT, getCourseDetailsByIdController.getCourseDetailsById);

/**
 * @swagger
 * /contentwriter/addCourse:
 *   post:
 *     summary: Add a new course
 *     description: Add a new course to the platform. This action requires authentication.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []  # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseName:
 *                 type: string
 *               courseDescription:
 *                 type: string
 *               coursethumbnail:
 *                 type: string
 *                 format: binary
 *             required:
 *               - courseName
 *     responses:
 *       201:
 *         description: Successfully added the new course.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error
 */
contentwriterRouter.post('/addCourse', upload.single('coursethumbnail'), addCourseController.addNewCourse);

/**
 * @swagger
 * /contentwriter/addCourseModule:
 *   post:
 *     summary: Add a course module
 *     description: Add a new module to a course. This action requires authentication.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: [] # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               moduleName:
 *                 type: 
 *               moduleDescription:
 *                 type: string
 *               coursemodulethumbnail:
 *                 type: string
 *                 format: binary
 *             required:
 *               - moduleName
 *               - courseId
 *     responses:
 *       201:
 *         description: Successfully added the course module.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error
 */
contentwriterRouter.post('/addCourseModule', upload.single('coursemodulethumbnail'), addCourseModuleController.addModuleToCourse);

/**
 * @swagger
 * /contentwriter/addcoursetask:
 *   post:
 *     summary: Add a new task to a course module
 *     description: |
 *       Creates a new task under a course module.
 *       Supported task types are LINK, FILE, and CODE.
 *       For LINK tasks, the link must be provided.
 *       For FILE tasks, a taskFile must be uploaded.
 *       A thumbnailFile can optionally be uploaded for any task type.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - moduleId
 *               - taskName
 *               - taskDescription
 *               - type
 *             properties:
 *               moduleId:
 *                 type: string
 *                 description: ID of the course module to which the task will be added.
 *                 example: 65f2a7c8e4b123456789abcd
 *               taskName:
 *                 type: string
 *                 description: Name of the course task.
 *                 example: Introduction to JavaScript
 *               taskDescription:
 *                 type: string
 *                 description: Description of the course task.
 *                 example: Learn the basics of JavaScript programming.
 *               type:
 *                 type: string
 *                 enum:
 *                   - LINK
 *                   - FILE
 *                   - CODE
 *                 description: Type of the course task.
 *                 example: LINK
 *               link:
 *                 type: string
 *                 description: URL for LINK task type.
 *                 example: https://developer.mozilla.org/en-US/docs/Web/JavaScript
 *               taskFile:
 *                 type: string
 *                 format: binary
 *                 description: File for FILE task type.
 *               thumbnailFile:
 *                 type: string
 *                 format: binary
 *                 description: Optional thumbnail image for the task.
 *     responses:
 *       201:
 *         description: Course task added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course task added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid request or missing task content.
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
 *                   example: Course task content is required
 *       500:
 *         description: Internal server error while adding the course task.
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
 *                   example: Failed to add course task
 */
contentwriterRouter.post('/addcoursetask', validateJWT,upload.fields([{name: 'taskFile',maxCount: 1,},{ name: 'thumbnailFile', maxCount: 1}]), addCourseTaskController.addTaskToModule);

/**
 * @swagger
 * /contentwriter/addCourseTaskQuestion:
 *   post:
 *     summary: Add a coding question to a course task
 *     description: |
 *       Adds a new coding question to an existing course task.
 *
 *       The question is created with ACTIVE status and an automatically
 *       calculated order. Starter code is not generated during question
 *       creation. It will be generated later based on the selected
 *       programming language.
 *
 *       Duplicate questions are checked case-insensitively within the
 *       same task.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - question
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: MongoDB ObjectId of the course task
 *                 example: "6ac0c4624e3e70ca5f8cdabb"
 *
 *               question:
 *                 type: string
 *                 description: Coding question text
 *                 example: "Write a function to find the sum of two numbers."
 *
 *               description:
 *                 type: string
 *                 description: Optional detailed description of the coding question
 *                 example: "Given two integers, return their sum."
 *
 *     responses:
 *
 *       201:
 *         description: Coding question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Course task question added successfully."
 *
 *                 taskId:
 *                   type: string
 *                   example: "6ac0c4624e3e70ca5f8cdabb"
 *
 *                 questionId:
 *                   type: string
 *                   example: "6ac0c4624e3e70ca5f8cdabc"
 *
 *                 questionCount:
 *                   type: integer
 *                   example: 2
 *
 *       400:
 *         description: Missing required fields or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: "Task ID and question are required."
 *
 *       404:
 *         description: Course task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: "Course task not found."
 *
 *       409:
 *         description: Duplicate question already exists in the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: "Course task question already exists."
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
 *
 *                 message:
 *                   type: string
 *                   example: "Failed to add course task question."
 */

contentwriterRouter.post('/addCourseTaskQuestion', validateJWT, addCourseTaskQuestionController.addCourseTaskQuestion); 

/**
 * @swagger
 * /contentwriter/getCourseTaskQuestions/{taskId}:
 *   get:
 *     summary: List the questions of a coding task
 *     description: |
 *       Returns every question of a coding task - text, description, publish state
 *       and the per-language starters a writer supplied - for the authoring UI.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: The questions of the task.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Server error.
 */
contentwriterRouter.get(
    '/getCourseTaskQuestions/:taskId',
    validateJWT,
    validateParamsSchema(courseTaskIdParamsSchema),
    getCourseTaskQuestionsController.getCourseTaskQuestions
);

/**
 * @swagger
 * /contentwriter/updateCourseTaskQuestion:
 *   put:
 *     summary: Update one question of a coding task
 *     description: |
 *       Edits a single question in place. Every field is optional, so a writer can
 *       correct only the wording, or archive a question.
 *       Questions other than `questionId` are never touched, and `starterCode` is
 *       not accepted here - the boilerplate is generated and cached per question +
 *       language on first open, so a posted starterCode is ignored.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - questionId
 *             properties:
 *               taskId:
 *                 type: string
 *                 example: 64f123456789abcdef123456
 *               questionId:
 *                 type: string
 *                 example: 64f123456789abcdef123999
 *               question:
 *                 type: string
 *                 example: Write a function to reverse a string.
 *               description:
 *                 type: string
 *                 example: Return an empty string for an empty input.
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - ARCHIVE
 *     responses:
 *       200:
 *         description: Question updated.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       404:
 *         description: Task or question not found.
 *       409:
 *         description: Another question on the task already has this text.
 *       500:
 *         description: Server error.
 */
contentwriterRouter.put(
    '/updateCourseTaskQuestion',
    validateJWT,
    validateRegistrationSchema(updateCourseTaskQuestionSchema),
    updateCourseTaskQuestionController.updateCourseTaskQuestion
);

/**
 * @swagger
 * /contentwriter/deleteCourseTaskQuestion/{taskId}/{questionId}:
 *   delete:
 *     summary: Remove one question from a coding task
 *     description: |
 *       Removes a single question together with its generated test cases and every
 *       run and submission made against it. The task and its progress record are
 *       kept.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the question to remove
 *     responses:
 *       200:
 *         description: Question removed.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       404:
 *         description: Task or question not found.
 *       500:
 *         description: Server error.
 */
contentwriterRouter.delete(
    '/deleteCourseTaskQuestion/:taskId/:questionId',
    validateJWT,
    validateParamsSchema(courseTaskQuestionIdParamsSchema),
    deleteCourseTaskQuestionController.deleteCourseTaskQuestion
);

/**
 * @swagger
 * /contentwriter/getCourseTaskContent/{id}:
 *   get:
 *     summary: Get a task's content (for viewing in a new tab)
 *     description: |
 *       Serves the content of a course task. For tasks of type `LINK` this
 *       redirects (302) to the stored external URL; for type `FILE` it streams
 *       the file from S3 inline so the browser renders or downloads it.
 *       The JWT may be supplied via the `auth_token` header or query parameter
 *       (so the URL can be opened directly in a new browser tab).
 *     tags:
 *       - ContentWriter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task whose content to serve
 *       - in: query
 *         name: auth_token
 *         required: false
 *         schema:
 *           type: string
 *         description: JWT token (alternative to the auth_token header)
 *     responses:
 *       200:
 *         description: File content streamed inline.
 *       302:
 *         description: Redirect to the external link.
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       404:
 *         description: Task or content not found.
 *       500:
 *         description: Server error
 */
contentwriterRouter.get('/getCourseTaskContent/:id', validateJWTForMedia, getCourseTaskContentController.getCourseTaskContent);

/**
 * @swagger
 * /contentwriter/updatecoursetask:
 *   put:
 *     summary: Update a course task
 *     description: |
 *       Update an existing course task as a Content Writer.
 *       The task name, description, status, and task content can be updated.
 *       A new task file or thumbnail can optionally be uploaded.
 *       For LINK tasks, provide the link.
 *       For FILE tasks, provide the taskFile.
 *       For CODE tasks, no file or link is required.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - moduleId
 *               - taskName
 *               - taskDescription
 *               - status
 *               - type
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the course task to update.
 *                 example: 64f123456789abcdef123456
 *               moduleId:
 *                 type: string
 *                 description: ID of the course module associated with the task.
 *                 example: 64f123456789abcdef654321
 *               taskName:
 *                 type: string
 *                 description: Updated name of the course task.
 *                 example: Node.js Introduction
 *               taskDescription:
 *                 type: string
 *                 description: Updated description of the course task.
 *                 example: Learn the fundamentals of Node.js
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - ARCHIVE
 *                 description: Updated status of the course task.
 *                 example: ACTIVE
 *               type:
 *                 type: string
 *                 enum:
 *                   - LINK
 *                   - FILE
 *                   - CODE
 *                 description: Type of the course task.
 *                 example: CODE
 *               link:
 *                 type: string
 *                 description: External link for LINK task type.
 *                 example: https://developer.mozilla.org/en-US/docs/Web/JavaScript
 *               taskFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Optional task content file.
 *                   Required when the task type is FILE and new file content is being uploaded.
 *               thumbnailFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Optional task thumbnail image.
 *                   Supported formats are JPG, JPEG, PNG, and WEBP.
 *     responses:
 *       200:
 *         description: Course task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responseAfterUpdate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f123456789abcdef123456
 *                     moduleId:
 *                       type: string
 *                       example: 64f123456789abcdef654321
 *                     taskName:
 *                       type: string
 *                       example: Node.js Introduction
 *                     taskDescription:
 *                       type: string
 *                       example: Learn the fundamentals of Node.js
 *                     thumbnail:
 *                       type: string
 *                       example: LMSData/Courses/CourseTaskThumbnails/abc123.png
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     type:
 *                       type: string
 *                       example: FILE
 *                     content:
 *                       type: string
 *                       example: LMSData/Courses/CourseTaskContent/video123.mp4
 *                     contentMimeType:
 *                       type: string
 *                       example: video/mp4
 *                     contentFileName:
 *                       type: string
 *                       example: nodejs-tutorial.mp4
 *       400:
 *         description: Invalid input, status, type, or thumbnail type.
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
 *                   example: Invalid course task details.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Internal server error.
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
 *                   example: Failed to update course task.
 */
contentwriterRouter.put('/updatecoursetask',validateJWT, upload.fields([{name: 'taskFile', maxCount: 1},{name: 'thumbnailFile', maxCount: 1,}]), updateCourseTaskController.updateCourseTask);

/**
 * @swagger
 * /contentwriter/updatecoursemodule:
 *   put:
 *     summary: Update a course module by content writer
 *     tags: 
 *       - ContentWriter
 *     security:
 *       - BearerAuth: [] # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - courseId
 *               - moduleName
 *               - moduleDescription
 *               - status
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the course module
 *               courseId:
 *                 type: string
 *                 description: ID of the course 
 *               moduleName:
 *                 type: string
 *                 description: Updated module name
 *               moduleDescription:
 *                 type: string
 *                 description: Updated module description
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Updated module thumbnail image (optional)
 *               status:
 *                 type: string
 *                 description: Updated status of the module ("ACTIVE" or "ARCHIVE")
 *     responses:
 *       200:
 *         description: Module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or status provided
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Internal server error
 */
contentwriterRouter.put('/updatecoursemodule', validateJWT, upload.single('thumbnail'), updateCourseModuleController.updateCourseModule);

/**
 * @swagger
 * /contentwriter/updatecourse:
 *   put:
 *     summary: Update course details (name, description, and status) 
 *     description: Allows a content writer to update a course by providing its ID along with new values for name, description, and status.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: [] # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - courseName
 *               - courseDescription
 *               - status
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the course
 *               courseName:
 *                 type: string
 *                 description: Updated course name
 *               courseDescription:
 *                 type: string
 *                 description: Updated course description
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Updated course thumbnail image (optional)
 *               status:
 *                 type: string
 *                 description: Updated status of the course ("ACTIVE" or "ARCHIVE")
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or status provided
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Internal server error
 */
contentwriterRouter.put('/updatecourse', validateJWT, upload.single('thumbnail'), updateCourseController.updateCourse);

export default contentwriterRouter;
