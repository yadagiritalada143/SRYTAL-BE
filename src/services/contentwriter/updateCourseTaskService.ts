import CourseTaskModel from '../../model/courseTaskModel';
import { IUpdateCourseTaskResponse } from '../../interfaces/courseTask';

const updateCourseTask = async (id: string, taskName: string, taskDescription: string, newThumbnail?: string, status?: string, newContent?: string, newContentMimeType?: string, newContentFileName?: string): Promise<IUpdateCourseTaskResponse> => {
    try {
        // const result = await CourseTaskModel.updateMany({ _id: id }, { taskName,  taskDescription, thumbnail, status });
        // if (!result) {
        //     return { success: false };
        // }

        // return { success: true, responseAfterUpdate: result };

        const existingTask = await CourseTaskModel.findById(id);

        if(!existingTask) {
            return {
                success: false,
            };
        }

         const oldThumbnail = existingTask.thumbnail;
         const oldContent = existingTask.content;

         const updateData: any = {
            taskName,
            taskDescription,
            status,
            
        };

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
