import CourseTaskModel from '../../model/courseTaskModel';

interface updateCourseTaskResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

const updateCourseTask = async (id: string, taskName: string, taskDescription: string, thumbnail: string, status: string): Promise<updateCourseTaskResponse> => {
    try {
        const result = await CourseTaskModel.updateMany({ _id: id }, { taskName,  taskDescription, thumbnail, status });
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterUpdate: result };
    } catch (error: any) {
        console.error(`Error in updating course task: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
}

export default { updateCourseTask };
