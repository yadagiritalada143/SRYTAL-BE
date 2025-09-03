import CourseModel from '../../model/coursesModel';

interface FetchCourseByIdResponse {
    success: boolean;
    coursedata?: any;
}

const getCourseByIdService = async (id: string): Promise<FetchCourseByIdResponse> => {
    try {
        const course = await CourseModel.find({})
            .populate({
                path: 'modules',
                populate: {
                    path: 'tasks',
                    model: 'CourseTaskModel'
                }
            })

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
