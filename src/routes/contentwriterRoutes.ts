import express, { Router } from 'express';
import validateJWT from '../middlewares/validateJWT';
import addCourseController from '../controllers/contentwriter/addCourseController';
import getAllCoursesController from '../controllers/contentwriter/getAllCoursesController';
import getCourseDetailsByIdController from '../controllers/contentwriter/getCourseByIdController';
import addCourseModuleController from '../controllers/contentwriter/addCourseModuleController';
import addCourseTaskController from '../controllers/contentwriter/addCourseTaskController';
import updateCourseTaskController from '../controllers/contentwriter/updateCourseTaskController';
import updateCourseModuleController from '../controllers/contentwriter/updateCourseModuleController';
import updateCourseController from '../controllers/contentwriter/updateCourseController';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const contentwriterRouter: Router = express.Router();

/**
 * @swagger
 * /contentwriter/getAllCourses:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all available courses.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: [] # JWT Bearer token required
 *     responses:
 *       200:
 *         description: Successfully retrieved the courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseName:
 *                     type: string
 *                   courseDescription:
 *                     type: string
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error
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
 *     description: Add a new task to an existing course module. This action requires authentication.
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
 *               moduleId:
 *                  type: string
 *               taskName:
 *                 type: string
 *               taskDescription:
 *                 type: string
 *               taskthumbnail:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *             required:
 *               - taskName
 *               - moduleId
 *     responses:
 *       201:
 *         description: Successfully added the task to the course module.
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Server error
 */
contentwriterRouter.post('/addCourseTask',  upload.single('taskthumbnail'), addCourseTaskController.addTaskToModule);

/**
 * @swagger
 * /contentwriter/updatecoursetask:
 *   put:
 *     summary: Update a course task deatils or status of the task
 *     description: Update an existing course task as a Content Writer. We can update the task name, description. Additionaly we can either ARCHIEVE the task or ACTIVE the task. This action requires authentication.
 *     tags:
 *       - ContentWriter
 *     security:
 *       - BearerAuth: [] # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - taskName
 *               - taskDescription
 *               - status
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the course task to update
 *               taskName:
 *                 type: string
 *                 description: Updated task name
 *               taskDescription:
 *                 type: string
 *                 description: Updated task description
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 description: Updated status of the task ("ACTIVE" or "ARCHIVE")
 *     responses:
 *       200:
 *         description: Course task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course task updated successfully"
 *       400:
 *         description: Invalid input or status provided
 *       401:
 *         description: Unauthorized. Missing or invalid Authorization header.
 *       500:
 *         description: Internal server error
 */
contentwriterRouter.put('/updatecoursetask', validateJWT, updateCourseTaskController.updateCourseTaskController);

/**
 * @swagger
 * /contentwriter/updatecoursemodule:
 *   put:
 *     summary: Update a course module by content writer
 *     tags: 
 *       - ContentWriter
 *     security:
 *       - bearerAuth: [] # JWT Bearer token required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 format: uri
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

contentwriterRouter.put('/updatecoursemodule', validateJWT, updateCourseModuleController.updateCourseModuleController);

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
 *         application/json:
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
 *                 format: uri
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
contentwriterRouter.put('/updatecourse', validateJWT, updateCourseController.updateCourseController)

export default contentwriterRouter;
