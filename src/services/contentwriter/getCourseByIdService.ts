import CourseModel from '../../model/coursesModel';

interface FetchCourseBYIdResponse {
    success: boolean;
    coursedata?: any;
}

const getCourseByIdService = async (_id: string): Promise<FetchCourseBYIdResponse> => {
    try {
        const course = await CourseModel.findById({ _id });

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
