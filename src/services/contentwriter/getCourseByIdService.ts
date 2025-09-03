import CourseModel from '../../model/coursesModel';

interface FetchCourseByIdResponse {
    success: boolean;
    coursedata?: any;
}

const getCourseByIdService = async (id: string): Promise<FetchCourseByIdResponse> => {
    try {
        const course = await CourseModel.findById(id).populate('modules');

        if (!course) {
            return { success: false };

        }

        return {
            success: true,
            coursedata: course
        };
    } catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};

export default { getCourseByIdService };
