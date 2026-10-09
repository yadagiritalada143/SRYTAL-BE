import CourseModel from '../../model/coursesModel';
import { stripHtmlTags } from '../../util/stripHtmlTags';

const addCourse = async (courseName: string, courseDescription: string, thumbnail: string, status: string, ) => {
    try {
        const CourseToSave: any = new CourseModel({ courseName, courseDescription: stripHtmlTags(courseDescription), thumbnail, status, });
        const result = await CourseToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding new course:', error);
        return { success: false };
    }
};

export default { addCourse };
