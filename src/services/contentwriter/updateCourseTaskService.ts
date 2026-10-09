import CourseTaskModel from '../../model/courseTaskModel';
import { IUpdateCourseTaskResponse } from '../../interfaces/courseTask';

const updateCourseTask = async (id: string, taskName: string, taskDescription: string, newThumbnail?: string, status?: string, newContent?: string, newContentMimeType?: string, newContentFileName?: string, isCoding?: boolean, question?: string, executionMode?: 'CALLABLE' | 'STDIN') : Promise<IUpdateCourseTaskResponse> => {
    try {
        const existingTask = await CourseTaskModel.findById(id);

        if (!existingTask) {
            return {
                success: false,
            };
        }

        const updateData: any = {
            taskName,
            taskDescription,
            status,
        };
        if (executionMode) {
            if (String(existingTask.type || '').toUpperCase() !== 'CODE') {
                throw new Error('EXECUTION_MODE_REQUIRES_CODING_TASK');
            }
            updateData.executionMode = executionMode;
        }
        const codingQuestionChanged =
            String(existingTask.type || '').toUpperCase() === 'CODE' &&
            existingTask.taskDescription !== taskDescription;
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
