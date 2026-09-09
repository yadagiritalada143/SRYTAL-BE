import { Request, Response } from 'express';
import getCourseTaskContentService from '../../services/contentwriter/getCourseTaskContentService';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';

/**
 * Serves a task's content so it can be opened in a new browser tab.
 *  - type 'LINK': redirect (302) to the stored external URL (YouTube, blog...).
 *  - type 'FILE': stream the file from S3 inline so the browser renders it
 *    (pdf/image) or downloads it (word/etc).
 */
const getCourseTaskContent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { success, task } = await getCourseTaskContentService.getCourseTaskContent(id);

        if (!success || !task || !task.content) {
            return res
                .status(404)
                .json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE });
        }

        if (task.type === 'LINK') {
            return res.redirect(task.content);
        }

        // type === 'FILE' -> stream from S3
        const responseFromS3: any = await uploadThumbnailToS3.getCourseMediaFromS3(task.content);

        res.setHeader('Content-Type', task.contentMimeType || responseFromS3.contentType || 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="${encodeURIComponent(task.contentFileName || task.taskName || 'content')}"`,
        );
        return res.status(200).send(responseFromS3.body);
    } catch (error: any) {
        console.error(`Error in fetching task content: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE });
    }
};

export default { getCourseTaskContent };
