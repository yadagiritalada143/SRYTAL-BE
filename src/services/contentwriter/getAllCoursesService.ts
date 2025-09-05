import CourseModel from '../../model/coursesModel';

interface FetchAllCoursesResponse {
    success: boolean;
    courses?: any;
}

const AllCoursesService = (status: string): Promise<FetchAllCoursesResponse> => {
    return new Promise((resolve, reject) => {
        CourseModel.find({status})
            .populate({
                path: 'modules',
                populate: {
                    path: 'tasks',
                    model: 'CourseTaskModel'
                }
            })
            .then((courses: any) => {
                if (!courses) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        courses: courses
                    });
                }
            })
            .catch((error: any) => {
                console.error(`Error in fetching Courses: ${error}`);
                reject({ success: false });
            });
    });
};

export default { AllCoursesService };
