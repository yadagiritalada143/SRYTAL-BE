import CourseModel from '../../model/coursesModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import { IFetchCourseByIdResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';
import { resolveQuestions } from '../../util/courseTaskQuestions';

const getCourseById = async (id: string): Promise<IFetchCourseByIdResponse> => {
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
        const courseData = course.toObject() as any;

        const taskIds = (courseData.modules || []).flatMap((module: any) =>
            (module.tasks || []).map((task: any) => task._id)
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

        courseData.thumbnailUrl = course.thumbnail
            ? await courseMedia.getCourseMediaSignedUrl(course.thumbnail)
            : '';

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
            success: true,
            coursedata: courseData
        };
    } catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};

export default { getCourseById };
