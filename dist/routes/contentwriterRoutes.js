"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const validateJWTForMedia_1 = __importDefault(require("../middlewares/validateJWTForMedia"));
const addCourseController_1 = __importDefault(require("../controllers/contentwriter/addCourseController"));
const getAllCoursesController_1 = __importDefault(require("../controllers/contentwriter/getAllCoursesController"));
const getCourseByIdController_1 = __importDefault(require("../controllers/contentwriter/getCourseByIdController"));
const addCourseModuleController_1 = __importDefault(require("../controllers/contentwriter/addCourseModuleController"));
const addCourseTaskController_1 = __importDefault(require("../controllers/contentwriter/addCourseTaskController"));
const getCourseTaskContentController_1 = __importDefault(require("../controllers/contentwriter/getCourseTaskContentController"));
const updateCourseTaskController_1 = __importDefault(require("../controllers/contentwriter/updateCourseTaskController"));
const updateCourseModuleController_1 = __importDefault(require("../controllers/contentwriter/updateCourseModuleController"));
const updateCourseController_1 = __importDefault(require("../controllers/contentwriter/updateCourseController"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
upload.fields([{ name: 'taskFile', maxCount: 1, }, { name: 'thumbnailFile', maxCount: 1, }]);
const contentwriterRouter = express_1.default.Router();
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
contentwriterRouter.get('/getAllCourses', validateJWT_1.default, getAllCoursesController_1.default.getAllCourses);
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
contentwriterRouter.get('/getCourseById/:id', validateJWT_1.default, getCourseByIdController_1.default.getCourseDetailsById);
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
contentwriterRouter.post('/addCourse', upload.single('coursethumbnail'), addCourseController_1.default.addNewCourse);
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
contentwriterRouter.post('/addCourseModule', upload.single('coursemodulethumbnail'), addCourseModuleController_1.default.addModuleToCourse);
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
contentwriterRouter.post('/addCourseTask', validateJWT_1.default, upload.fields([{ name: 'taskFile', maxCount: 1, }, { name: 'thumbnailFile', maxCount: 1 }]), addCourseTaskController_1.default.addTaskToModule);
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
contentwriterRouter.get('/getCourseTaskContent/:id', validateJWTForMedia_1.default, getCourseTaskContentController_1.default.getCourseTaskContent);
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
 *       400:
 *         description: Invalid input, status, or thumbnail type
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Internal server error
 */
contentwriterRouter.put('/updatecoursetask', validateJWT_1.default, upload.fields([{ name: 'taskFile', maxCount: 1 }, { name: 'thumbnailFile', maxCount: 1, }]), updateCourseTaskController_1.default.updateCourseTask);
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
contentwriterRouter.put('/updatecoursemodule', validateJWT_1.default, upload.single('thumbnail'), updateCourseModuleController_1.default.updateCourseModule);
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
contentwriterRouter.put('/updatecourse', validateJWT_1.default, upload.single('thumbnail'), updateCourseController_1.default.updateCourse);
exports.default = contentwriterRouter;
