import CourseTaskModel from '../../model/courseTaskModel';
import { IFetchCourseTaskContentResponse } from '../../interfaces/courseTask';

const getCourseTaskContent = async (id: string): Promise<IFetchCourseTaskContentResponse> => {
    try {
        const task = await CourseTaskModel.findById(id);
        if (!task) {
            return { success: false };
        }
        return { success: true, task };
    } catch (error) {
        console.error(`Error in fetching course task content: ${error}`);
        return { success: false };
    }
};

export default { getCourseTaskContent };
