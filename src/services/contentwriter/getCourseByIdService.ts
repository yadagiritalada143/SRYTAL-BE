import CourseModel from '../../model/coursesModel';

interface FetchCourseByIdResponse {
    success: boolean;
    coursedata?: any;
}

const getCourseById = async (id: string): Promise<FetchCourseByIdResponse> => {
    try {
        const course = await CourseModel.findById(id)
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

export default { getCourseById };
