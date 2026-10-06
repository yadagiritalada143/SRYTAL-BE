import CourseModel from '../../model/coursesModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import { IFetchAllCoursesResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';
import { resolveQuestions } from '../../util/courseTaskQuestions';

const AllCourses = async (): Promise<IFetchAllCoursesResponse> => {
    try {
        const courses = await CourseModel.find()
            .populate({
                path: 'modules',
                populate: {
                    path: 'tasks',
                    model: 'CourseTaskModel'
                }
            });

        const courseDocuments = courses.map((course: any) => course.toObject());
        const taskIds = courseDocuments.flatMap((course: any) =>
            (course.modules || []).flatMap((module: any) =>
                (module.tasks || []).map((task: any) => task._id)
            )
        );

        const persistedQuestions = taskIds.length > 0
            ? await TaskCodingQuestionModel.find({
                taskId: { $in: taskIds }
            })
                .sort({ order: 1 })
                .lean()
            : [];

        const questionsByTask = new Map<string, any[]>();
        for (const question of persistedQuestions) {
            const taskId = String(question.taskId);
            const taskQuestions = questionsByTask.get(taskId) || [];
            taskQuestions.push({
                questionId: String(question._id),
                question: question.question,
                description: question.description || '',
                status: question.status,
                order: question.order,
                starterCode: question.starterCode || []
            });
            questionsByTask.set(taskId, taskQuestions);
        }

        const coursesWithThumbnailUrl = await Promise.all(
            courseDocuments.map(async (courseData: any) => {
                let thumbnailUrl = '';

                if (courseData.thumbnail) {
                    thumbnailUrl =
                        await courseMedia.getCourseMediaSignedUrl(
                            courseData.thumbnail
                        );
                }

                if (Array.isArray(courseData.modules)) {
                    for (const module of courseData.modules) {
                        module.thumbnailUrl = module.thumbnail
                            ? await courseMedia.getCourseMediaSignedUrl(module.thumbnail)
                            : '';
                        if (Array.isArray(module.tasks)) {
                            for (const task of module.tasks) {
                                const taskQuestions =
                                    questionsByTask.get(String(task._id));
                                task.questions = taskQuestions?.length
                                    ? taskQuestions
                                    : resolveQuestions(task);

                                task.thumbnailUrl = task.thumbnail
                                    ? await courseMedia.getCourseMediaSignedUrl(task.thumbnail)
                                    : '';
                            }
                        }
                    }
                }

                return {
                    ...courseData,
                    thumbnailUrl,
                };
            })
        );

        let totalCourses = coursesWithThumbnailUrl.length;
        let totalModules = 0;
        let totalTasks = 0;

        for (const course of coursesWithThumbnailUrl) {
            const modules = Array.isArray(course.modules) ? course.modules : [];
            totalModules += modules.length;
            for (const module of modules) {
                totalTasks += Array.isArray(module.tasks) ? module.tasks.length : 0;
            }
        }

        return {
            success: true,
            courses: coursesWithThumbnailUrl,
            totals: { totalCourses, totalModules, totalTasks },
        };
    } catch (error) {
        console.error('Error in getting all courses:', error);
        throw error;
    }
};

export default { AllCourses };
