import CourseModel from '../../model/coursesModel';

interface updateCourseResponse {
    success: boolean;
    responseAfterUpdateCourse?: any;
}

const updateCourse = async (id: string, courseName: string, courseDescription: string, thumbnail: string, status: string ):Promise<updateCourseResponse> => {
    try{
        const result = await CourseModel.updateOne({_id: id}, { courseName, courseDescription, thumbnail, status })
        if (!result) {
             return { success: false };
        }

         return { success: true, responseAfterUpdateCourse: result };
    } catch(error:any){
        console.error(`Error in updating Course: ${error}`);
         return { success: false, responseAfterUpdateCourse: error };
    }
}

export default { updateCourse };
