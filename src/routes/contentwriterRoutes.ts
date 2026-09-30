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
 * /contentwriter/addCourseTask:
 *   post:
 *     summary: Add a task to a course module
 *     description: |
 *       Add a new task to an existing course module.
 *
 *       A task can contain either:
 *       - An uploaded task file such as PDF, Word document, video, etc.
 *       - An external link such as YouTube or a blog URL.
 *
 *       A thumbnail can optionally be uploaded for the task.
 *
 *       This action requires authentication.
 *
 *     tags:
 *       - ContentWriter
 *
 *     security:
 *       - BearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - taskName
 *               - moduleId
 *             properties:
 *               taskName:
 *                 type: string
 *                 description: Name of the task
 *                 example: Node.js Introduction
 *
 *               taskDescription:
 *                 type: string
 *                 description: Description of the task
 *                 example: Learn the fundamentals of Node.js
 *
 *               moduleId:
 *                 type: string
 *                 description: ID of the course module
 *                 example: 64f123456789abcdef123456
 *
 *               link:
 *                 type: string
 *                 format: uri
 *                 description: |
 *                   External content URL.
 *                   Use this when taskFile is not uploaded.
 *                 example: https://www.youtube.com/watch?v=example
 *
 *               isCoding:
 *                 type: boolean
 *                 description: |
 *                   Marks the task as a coding task.
 *                   When true, no file or link is needed and the task can hold
 *                   many questions, added through /addCourseTaskQuestion.
 *                 example: true
 *
 *               question:
 *                 type: string
 *                 description: |
 *                   LEGACY single question. A coding task no longer needs one up
 *                   front - pass `questions` instead, or attach them afterwards.
 *                 example: Write a function to reverse a string.
 *
 *               questions:
 *                 type: array
 *                 description: |
 *                   Optional. The questions of a coding task, when the writer wants
 *                   to create them all in one request. Each one is graded
 *                   independently. Send as a JSON array (JSON body) or as a
 *                   JSON-encoded string (multipart form field).
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                   properties:
 *                     question:
 *                       type: string
 *                       example: Write a function to reverse a string.
 *                     description:
 *                       type: string
 *                       example: Return an empty string for an empty input.
 *
 *               taskFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Optional task content file.
 *
 *                   Supported content can include:
 *                   PDF, DOC, DOCX, PPT, PPTX, MP4,
 *                   WebM, and other supported file types.
 *
 *               thumbnailFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Optional task thumbnail image.
 *
 *                   Supported formats:
 *                   JPG, JPEG, PNG, WEBP.
 *
 *     responses:
 *       201:
 *         description: Successfully added the task to the course module.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course task added successfully
 *                 taskId:
 *                   type: string
 *                   example: 64f123456789abcdef123456
 *                 taskName:
 *                   type: string
 *                   example: Node.js Introduction
 *                 taskDescription:
 *                   type: string
 *                   example: Learn the fundamentals of Node.js
 *                 type:
 *                   type: string
 *                   enum:
 *                     - FILE
 *                     - LINK
 *                   example: FILE
 *                 thumbnail:
 *                   type: string
 *                   example: LMSData/Courses/CourseTaskThumbnails/abc123.png
 *                 content:
 *                   type: string
 *                   example: LMSData/Courses/CourseTaskContent/video123.mp4
 *                 isCoding:
 *                   type: boolean
 *                   example: true
 *                 question:
 *                   type: string
 *                   description: LEGACY mirror of the first question
 *                   example: Write a function to reverse a string.
 *                 questions:
 *                   type: array
 *                   description: The questions created with the task
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionId:
 *                         type: string
 *                         example: 64f123456789abcdef123999
 *                       question:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       order:
 *                         type: integer
 *                 questionCount:
 *                   type: integer
 *                   example: 2
 *
 *       400:
 *         description: Invalid request or missing task content.
 *
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *
 *       500:
 *         description: Server error.
 */
contentwriterRouter.post('/addCourseTask', validateJWT,upload.fields([{name: 'taskFile',maxCount: 1,},{ name: 'thumbnailFile', maxCount: 1}]), addCourseTaskController.addTaskToModule);

/**
 * @swagger
 * /contentwriter/addCourseTaskQuestion:
 *   post:
 *     summary: Add a question to a coding task
 *     description: |
 *       Attaches one more question to an existing coding task. A coding task can
 *       hold many questions and each one is graded on its own, with its own test
 *       cases, submissions and starter code.
 *
 *       Content writers send only the question text and an optional description.
 *       There is no starter-code field here on purpose: the per-language boilerplate
 *       is generated for the selected question and language the first time an
 *       employee opens it. A writer who does want to hand-write a starter can add one
 *       later through /updateCourseTaskQuestion.
 *
 *       This action requires authentication.
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
 *               - question
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: ID of the coding task the question belongs to
 *                 example: 64f123456789abcdef123456
 *               question:
 *                 type: string
 *                 description: The coding problem statement
 *                 example: Write a function to reverse a string.
 *               description:
 *                 type: string
 *                 description: Optional extra guidance shown with the question
 *                 example: Return an empty string for an empty input.
 *     responses:
 *       201:
 *         description: Question added to the task.
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
 *                   example: Question added to the task successfully !
 *                 taskId:
 *                   type: string
 *                   example: 64f123456789abcdef123456
 *                 questionId:
 *                   type: string
 *                   description: ID of the question that was created
 *                   example: 64f123456789abcdef123999
 *                 questionCount:
 *                   type: integer
 *                   description: How many questions the task holds now
 *                   example: 3
 *       400:
 *         description: Invalid request, the task is not a coding task, or the question limit was reached.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       404:
 *         description: Task not found.
 *       409:
 *         description: The task already contains this question.
 *       500:
 *         description: Server error.
 */
contentwriterRouter.post(
    '/addCourseTaskQuestion',
    validateJWT,
    validateRegistrationSchema(addCourseTaskQuestionSchema),
    addCourseTaskQuestionController.addCourseTaskQuestion
);

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
 *       The task name, description, and status can be updated.
 *       A new task file or thumbnail can optionally be uploaded.
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
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the course task to update
 *                 example: 64f123456789abcdef123456
 *               moduleId:
 *                 type: string
 *                 description: ID of the course module associated with the task
 *                 example: 64f123456789abcdef654321
 *               taskName:
 *                 type: string
 *                 description: Updated name of the course task
 *                 example: Node.js Introduction
 *               taskDescription:
 *                 type: string
 *                 description: Updated description of the course task
 *                 example: Learn the fundamentals of Node.js
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - ARCHIVE
 *                 description: Updated status of the course task
 *                 example: ACTIVE
 *               taskFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Optional task content file.
 *                   Can be a PDF, Word document, video,
 *                   or other supported content file.
 *               thumbnailFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Optional task thumbnail image.
 *                   Supported formats are JPG, JPEG, PNG, and WEBP.
 *               link:
 *                 type: string
 *                 description: Optional external link for the task content (used when no file is uploaded)
 *               isCoding:
 *                 type: boolean
 *                 description: |
 *                   Marks the task as a coding task.
 *                   When true, `question` is required.
 *                 example: true
 *               question:
 *                 type: string
 *                 description: |
 *                   The coding problem statement. Required when isCoding is true.
 *                 example: Write a function to reverse a string.
 *     responses:
 *       200:
 *         description: Course task updated successfully
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
 *                     isCoding:
 *                       type: boolean
 *                       example: true
 *                     question:
 *                       type: string
 *                       example: Write a function to reverse a string.
 *       400:
 *         description: Invalid input, status, or thumbnail type
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Internal server error
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
