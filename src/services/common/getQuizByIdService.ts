import { Types } from 'mongoose';
import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import TaskProgressModel from '../../model/taskProgressModel';
import { IFetchQuizByIdResponse, IQuizQuestion, IQuizQuestionOption } from '../../interfaces/myCourses';

/** Fisher-Yates shuffle that never mutates the input array. */
const shuffle = <T>(items: T[]): T[] => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Converts a stored question into the employee-facing view model. The correct
 * answer flag is never copied across — only `optionId` and `value` leave the
 * service. Option ids are derived from the option's index in the persisted
 * array (`opt-0`, `opt-1`, ...), so they stay stable across shuffles and
 * attempts even though the stored options carry no `_id` of their own.
 */
const toQuizQuestion = (question: any): IQuizQuestion => {
    const type = String(question.type || '').toUpperCase();

    if (type === 'TEXTAREA' || !Array.isArray(question.options) || question.options.length === 0) {
        return {
            questionId: String(question._id),
            question: question.question,
            type
        };
    }

    const identifiedOptions: IQuizQuestionOption[] = question.options.map((option: any, index: number) => ({
        optionId: option && option._id != null ? String(option._id) : `opt-${index}`,
        value: option ? option.value : ''
    }));

    return {
        questionId: String(question._id),
        question: question.question,
        type,
        options: shuffle(identifiedOptions)
    };
};

/**
 * Employee-facing quiz fetch. Serves only published questions (SHOW, not
 * deleted) of an ACTIVE QUIZ task that belongs to a course the employee is
 * actually assigned to — the same assignment scoping every other
 * "my courses" endpoint uses. Question order and option order are shuffled per
 * call; nothing is written back to the question documents. Each call with at
 * least one question mints a new quiz attempt on the existing task-progress
 * row (no separate collection) and returns its id, so an explicit reattempt
 * always gets a fresh randomization and a fresh attemptId.
 */
const getQuizById = async (
    taskId: string,
    employeeId: string
): Promise<IFetchQuizByIdResponse> => {
    if (!taskId || !Types.ObjectId.isValid(taskId)) {
        return { success: false, invalidTaskId: true };
    }

    try {
        const task: any = await CourseTaskModel.findById(taskId)
            .select('moduleId taskName type status')
            .lean();

        if (!task) {
            return { success: false, taskNotFound: true };
        }

        if ((task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        if ((task.status || '').toUpperCase() !== 'ACTIVE') {
            return { success: false, taskInactive: true };
        }

        const parentModule: any = await CourseModuleModel.findById(task.moduleId)
            .select('courseId')
            .lean();

        if (!parentModule || !parentModule.courseId) {
            return { success: false, notFound: true };
        }

        const [assignment, course] = await Promise.all([
            CourseAssignment.findOne({ courseId: parentModule.courseId, employeeId }).lean(),
            CourseModel.findById(parentModule.courseId).select('status').lean()
        ]);

        // Archived courses (and employees with no assignment for the course that
        // owns the task) may not reach the quiz.
        if (
            !assignment ||
            (course && String((course as any).status || '').toUpperCase() === 'ARCHIVE')
        ) {
            return { success: false, notFound: true };
        }

        const storedQuestions: any[] = await CourseQuizQuestionModel.find({
            taskId,
            isDeleted: false,
            status: 'SHOW'
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();

        const questions = shuffle(storedQuestions).map(toQuizQuestion);

        let attemptId: string | undefined;

        if (questions.length > 0) {
            const existingProgress: any = await TaskProgressModel.findOne({
                courseAssignmentId: assignment._id,
                moduleId: parentModule._id,
                taskId
            })
                .select('quizAttempts')
                .lean();

            const attemptNumber = ((existingProgress?.quizAttempts || []).length || 0) + 1;
            const attemptObjectId = new Types.ObjectId();

            // Upsert keeps a single progress row per (assignment, module, task) —
            // the collection's unique index — and only the attempt list grows.
            // isCompleted is left untouched on resume, set to false on first insert.
            await TaskProgressModel.findOneAndUpdate(
                {
                    courseAssignmentId: assignment._id,
                    moduleId: parentModule._id,
                    taskId
                },
                {
                    $setOnInsert: {
                        courseAssignmentId: assignment._id,
                        moduleId: parentModule._id,
                        taskId,
                        isCompleted: false,
                        completedAt: null
                    },
                    $push: {
                        quizAttempts: {
                            _id: attemptObjectId,
                            attemptNumber,
                            startedAt: new Date()
                        }
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            attemptId = String(attemptObjectId);
        }

        return {
            success: true,
            taskId,
            attemptId,
            taskName: task.taskName,
            totalQuestions: questions.length,
            questions
        };
    } catch (error: any) {
        console.error(`Error in fetching quiz by id for task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { getQuizById };
