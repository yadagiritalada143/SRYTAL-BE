import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { resolveQuestions } from '../../util/courseTaskQuestions';
import { MAX_QUESTIONS_PER_TASK } from '../../constants/contentwriter/coursetaskQuestionMessages';
import {
    IAddCourseTaskQuestionInput,
    IAddCourseTaskQuestionResponse
} from '../../interfaces/courseTask';

/** Escapes a question so it can be compared inside a case-insensitive $regex. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Appends a question to an existing coding task.
 *
 * The write is a single atomic `$push`, so two writers adding to the same task at
 * the same time cannot lose one another's question the way a read-modify-write
 * would. The duplicate and limit guards are checked inside the same update filter
 * so they hold under concurrency too - if either fails, nothing is written.
 */
const addCourseTaskQuestion = async (
    input: IAddCourseTaskQuestionInput
): Promise<IAddCourseTaskQuestionResponse> => {
    const taskId = String(input.taskId || '').trim();

    try {
        const task: any = await CourseTaskModel.findById(taskId).lean();

        if (!task) {
            return { success: false, notFound: true };
        }

        if (!task.isCoding) {
            return { success: false, notCodingTask: true };
        }

        const question = String(input.question || '').trim();
        if (!question) {
            return { success: false };
        }

        // A task created before the multi-question change still keeps its single
        // question in the top-level `question` field. Left alone, the first append
        // would create questions[] with only the new entry and the legacy question
        // would silently vanish from every read path (resolveQuestions prefers
        // questions[]). So promote it into the array first.
        //
        // The promoted entry keeps `questionId: null` on purpose: the task's existing
        // test cases and code runs are keyed to null, and that is exactly the value
        // the read path resolves a null question id to, so its history stays attached.
        // The backfill promotes it to a real id later.
        let currentTask = task;
        if (!(Array.isArray(task.questions) && task.questions.length > 0)) {
            const legacyQuestion = String(task.question || '').trim();

            if (legacyQuestion) {
                await CourseTaskModel.updateOne(
                    {
                        _id: taskId,
                        isCoding: true,
                        $or: [{ questions: { $exists: false } }, { questions: { $size: 0 } }]
                    },
                    {
                        $push: {
                            questions: {
                                questionId: null,
                                question: legacyQuestion,
                                description: String(task.taskDescription || ''),
                                status: 'ACTIVE',
                                order: 0,
                                starterCode: Array.isArray(task.starterCode) ? task.starterCode : [],
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        }
                    }
                ).catch((error: any) => {
                    console.error(`Could not promote the legacy question of task ${taskId}: ${error?.message || error}`);
                });

                // Re-read so the duplicate/limit checks and the new question's `order`
                // are computed against the array as it now stands.
                currentTask = (await CourseTaskModel.findById(taskId).lean()) || task;
            }
        }

        const existingQuestions = resolveQuestions(currentTask);
        const alreadyExists = existingQuestions.some(
            (entry) => entry.question.toLowerCase() === question.toLowerCase()
        );

        if (alreadyExists) {
            return { success: false, duplicateQuestion: true, questionCount: existingQuestions.length };
        }

        if (existingQuestions.length >= MAX_QUESTIONS_PER_TASK) {
            return { success: false, limitReached: true, questionCount: existingQuestions.length };
        }

        const order = existingQuestions.length;

        const updatedTask: any = await CourseTaskModel.findOneAndUpdate(
            {
                _id: taskId,
                isCoding: true,
                questions: {
                    $not: { $elemMatch: { question: { $regex: `^${escapeRegExp(question)}$`, $options: 'i' } } }
                },
                $expr: {
                    $lt: [
                        {
                            // An unmigrated task has no questions[] yet but still counts
                            // its top-level question, so the guard has to count it too -
                            // otherwise the last slot could be oversold by one.
                            $add: [
                                { $size: { $ifNull: ['$questions', []] } },
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: [{ $size: { $ifNull: ['$questions', []] } }, 0] },
                                                { $ne: [{ $ifNull: ['$question', ''] }, ''] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            ]
                        },
                        MAX_QUESTIONS_PER_TASK
                    ]
                }
            },
            {
                $push: {
                    questions: {
                        question,
                        description: String(input.description || ''),
                        status: 'ACTIVE',
                        order,
                        // Left empty on purpose: the boilerplate is generated and
                        // cached per language the first time an employee opens this
                        // question, so a new question starts with nothing cached.
                        starterCode: []
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            // The guarded filter rejected the write, so either a concurrent writer
            // added the same question or the task filled up since the read. Re-read
            // to report which, rather than blaming the caller for both.
            const current: any = await CourseTaskModel.findById(taskId).lean();
            const currentQuestions = current ? resolveQuestions(current) : existingQuestions;

            const isDuplicate = currentQuestions.some(
                (entry) => entry.question.toLowerCase() === question.toLowerCase()
            );

            return {
                success: false,
                duplicateQuestion: isDuplicate,
                limitReached: !isDuplicate,
                questionCount: currentQuestions.length
            };
        }

        // Propagate activity up: touch the parent course's updatedAt.
        const module: any = await CourseModuleModel.findById(task.moduleId).lean();
        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
        }

        const savedQuestions = Array.isArray(updatedTask.questions) ? updatedTask.questions : [];
        const added = savedQuestions[savedQuestions.length - 1];

        return {
            success: true,
            taskId,
            questionId: added?.questionId ? String(added.questionId) : null,
            questionCount: savedQuestions.length
        };
    } catch (error: any) {
        console.error(`Error in adding a question to course task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { addCourseTaskQuestion };
