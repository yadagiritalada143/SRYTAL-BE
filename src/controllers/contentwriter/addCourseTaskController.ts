import { Request, Response } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import addNewCourseTaskService from '../../services/contentwriter/addCourseTaskService';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseTaskContentFolder, courseTaskThumbnailsFolder } from '../../config/awsS3Config';
import { parseQuestionsField } from '../../util/courseTaskQuestions';
import { MAX_QUESTIONS_PER_TASK } from '../../constants/contentwriter/coursetaskQuestionMessages';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';

// Uploads one multer file to the given S3 folder under a unique name and
// returns the object key.
const uploadToS3 = async (
    file: Express.Multer.File,
    folder: string
): Promise<string> => {
    const uniqueName = uuidv4() + path.extname(file.originalname);

    await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, file.buffer, file.mimetype, folder);

    return `${folder}/${uniqueName}`;
};

const addTaskToModule = async (req: Request, res: Response) => {
    try {
        const { moduleId, taskName, taskDescription, link, isCoding, question, questions } = req.body;
        const status = 'ACTIVE';

        // Coding tasks are flagged via isCoding (string from multipart form or boolean).
        const isCodingTask = isCoding === true || isCoding === 'true' || isCoding === 1 || isCoding === '1';

        // A coding task holds its own list of questions, so it no longer needs one
        // up front: the writer can create the task now and attach questions through
        // /addCourseTaskQuestion, or send them all in this request.
        const parsedQuestions = parseQuestionsField(questions);

        if (isCodingTask && parsedQuestions.length > MAX_QUESTIONS_PER_TASK) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_QUESTION_LIMIT_MESSAGE
            });
        }

        //get uploaded files 
        //  taskFile       -> PDF, Word, Video, etc.
        //  thumbnailFile  -> JPG, PNG, WEBP, etc.
        const files = req.files as {[fieldname: string]: Express.Multer.File[]};

        const taskFile = files?.taskFile?.[0];
        const thumbnailFile = files?.thumbnailFile?.[0];

        // A task's content is flexible: either an uploaded file (pdf/word/any)
        // or an external link (YouTube, blog, etc).
        let type = 'LINK';
        let content = link || '';
        let contentMimeType = '';
        let contentFileName = '';

        let thumbnailPath = '';

        // When a file is uploaded, push it to S3 and store the object key.
        if (taskFile) {
            content = await uploadToS3(taskFile, courseTaskContentFolder);
            type = 'FILE';
            contentMimeType = taskFile.mimetype;
            contentFileName = taskFile.originalname;
        }

        if (thumbnailFile) {
            thumbnailPath = await uploadToS3(thumbnailFile, courseTaskThumbnailsFolder);
        }


        if (!isCodingTask && !content) {
            return res
            .status(400).json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE });
        }

        const responseAfteraddingCourseTask: any = await addNewCourseTaskService.addCourseTask(
            moduleId,
            taskName,
            taskDescription,
            thumbnailPath,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
            isCodingTask,
            question || '',
            parsedQuestions
        );

        if (responseAfteraddingCourseTask && responseAfteraddingCourseTask.id) {
            const savedQuestions = Array.isArray(responseAfteraddingCourseTask.questions)
                ? responseAfteraddingCourseTask.questions
                : [];

            return res.status(201).json({
                message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
                taskId: responseAfteraddingCourseTask.id,
                taskName: responseAfteraddingCourseTask.taskName,
                taskDescription: responseAfteraddingCourseTask.taskDescription,
                type: responseAfteraddingCourseTask.type,
                // The ids come back so a writer can attach test cases or edit a
                // question straight away without a second round trip.
                questions: savedQuestions,
                questionCount: savedQuestions.length
            });
        }


        return res
            .status(400)
            .json({ message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    } catch (error: any) {
        console.error(`Error in adding Task to Module: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }
};

export default { addTaskToModule };
