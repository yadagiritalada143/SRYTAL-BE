import CourseTaskModel from '../../model/courseTaskModel';
import { IUpdateCourseTaskResponse } from '../../interfaces/courseTask';
import { stripHtmlTags } from '../../util/stripHtmlTags';

const updateCourseTask = async (id: string, taskName: string, taskDescription: string, newThumbnail?: string, status?: string, newContent?: string, newContentMimeType?: string, newContentFileName?: string, isCoding?: boolean, question?: string, executionMode?: 'CALLABLE' | 'STDIN', acknowledgementText?: string, orderIdx?: number) : Promise<IUpdateCourseTaskResponse> => {
    try {
        const existingTask = await CourseTaskModel.findById(id);

        if (!existingTask) {
            return {
                success: false,
                responseAfterUpdate: 'COURSE_TASK_NOT_FOUND',
            };
        }

        if (orderIdx !== undefined) {
            if (!Number.isInteger(orderIdx) || orderIdx < 1) {
                return {
                    success: false,
                    responseAfterUpdate: 'COURSE_TASK_INVALID_ORDER_IDX'
                };
            }

            const taskWithSameOrderIdx = await CourseTaskModel.findOne({
                moduleId: existingTask.moduleId,
                orderIdx,
                _id: { $ne: id }
            })
                .select('_id')
                .lean();

            if (taskWithSameOrderIdx) {
                return {
                    success: false,
                    responseAfterUpdate: 'COURSE_TASK_DUPLICATE_ORDER_IDX'
                };
            }
        }

        const taskWithSameName = await CourseTaskModel.findOne({ taskName, _id: { $ne: id } });
        if (taskWithSameName) {
            return {
                success: false,
                responseAfterUpdate: 'COURSE_TASK_DUPLICATE_NAME'
            };
        }

        const cleanTaskDescription = stripHtmlTags(taskDescription);

        const updateData: any = {
            taskName,
            taskDescription: cleanTaskDescription,
            status,
        };
        if (orderIdx !== undefined) {
            updateData.orderIdx = orderIdx;
        }
        if (acknowledgementText !== undefined) {
            const cleanAcknowledgementText = stripHtmlTags(acknowledgementText);
            if (
                cleanAcknowledgementText &&
                String(existingTask.type || '').toUpperCase() !== 'FILE'
            ) {
                return {
                    success: false,
                    responseAfterUpdate: new Error('COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY')
                };
            }
            updateData.acknowledgementText = cleanAcknowledgementText;
        }
        if (executionMode) {
            if (String(existingTask.type || '').toUpperCase() !== 'CODE') {
                throw new Error('EXECUTION_MODE_REQUIRES_CODING_TASK');
            }
            updateData.executionMode = executionMode;
        }
        const codingQuestionChanged =
            String(existingTask.type || '').toUpperCase() === 'CODE' &&
            existingTask.taskDescription !== cleanTaskDescription;
        if (codingQuestionChanged) {
            updateData.starterCode = [];
        }

        if (newThumbnail) {
            updateData.thumbnail = newThumbnail;
        }

        if (newContent) {
            updateData.content = newContent;

            updateData.contentMimeType =
                newContentMimeType;

            updateData.contentFileName =
                newContentFileName;
        }

        const updatedTask =
            await CourseTaskModel.findByIdAndUpdate(
                id,
                {
                    $set: updateData,
                    ...(codingQuestionChanged
                        ? { $unset: { baseBoilerplate: 1 } }
                        : {})
                },
                {
                    new: true,
                    runValidators: true,
                },
            );

        if (!updatedTask) {
            return {
                success: false,
            };
        }

        return {
            success: true,
            responseAfterUpdate: updatedTask,
        };

    } catch (error: any) {
        console.error(`Error in updating course task: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
}

export default { updateCourseTask };
