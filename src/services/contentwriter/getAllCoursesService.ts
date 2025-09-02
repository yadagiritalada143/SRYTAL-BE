
import CourseModel from '../../model/coursesModel';

interface FetchAllCoursesResponse {
    success: boolean;
    courses?: any;
}

const AllCoursesService  = (): Promise<FetchAllCoursesResponse> => {
    return new Promise((resolve, reject) => {
        CourseModel.find({})
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
                console.error(`Error in fetching Courses: ${error}` );
                reject({ success: false });
            });
    });
};

export default { AllCoursesService };
