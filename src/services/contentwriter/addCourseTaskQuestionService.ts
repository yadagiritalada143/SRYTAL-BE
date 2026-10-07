import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';

import {
    IAddCourseTaskQuestionResponse
} from '../../interfaces/courseTask';

const addCourseTaskQuestion = async ( taskId: string, question: string, description?: string): Promise<IAddCourseTaskQuestionResponse> => {

    try {

        if (!taskId || !question) {
            return {
                success: false
            };
        }

        /**
         * ---------------------------------------------------------
         * 2. Find task
         * ---------------------------------------------------------
         */

        const task: any = await CourseTaskModel.findById(taskId).lean();

        if (!task) {
            return {
                success: false,
                 notFound: true
         };
        }

        const questionCount =
            await TaskCodingQuestionModel.countDocuments({
                taskId,
                status: {
                    $ne: 'INACTIVE'
                }
            });
        /**
         * ---------------------------------------------------------
         * 6. Check duplicate question
         * ---------------------------------------------------------
         */

        const existingQuestion =
            await TaskCodingQuestionModel.findOne({
                taskId,
                question: {
                    $regex: `^${escapeRegExp(question)}$`,
                    $options: 'i'
                },
                status: {
                    $ne: 'INACTIVE'
                }
            }).lean();

        if (existingQuestion) {
            return {
                success: false,
                duplicateQuestion: true,
                questionCount
            };
        }

        /**
         * ---------------------------------------------------------
         * 7. Determine question order
         * ---------------------------------------------------------
         */

        const lastQuestion =
            await TaskCodingQuestionModel
                .findOne({
                    taskId
                })
                .sort({
                    order: -1
                })
                .select('order')
                .lean();

        const order =
            typeof lastQuestion?.order === 'number'
                ? lastQuestion.order + 1
                : 0;

        /**
         * ---------------------------------------------------------
         * 8. Create question
         * ---------------------------------------------------------
         *
         * No starter code is generated here.
         *
         * Starter code will be generated when employee opens:
         *
         * taskId + questionId + languageId
         *
         * ---------------------------------------------------------
         */

        const newQuestion = await TaskCodingQuestionModel.create({ taskId, question, description, status: 'ACTIVE', order, starterCode: []});

        /**
         * ---------------------------------------------------------
         * 9. Update parent course timestamp
         * ---------------------------------------------------------
         */

        const module: any =
            await CourseModuleModel
                .findById(task.moduleId)
                .select('courseId')
                .lean();

        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(
                module.courseId,
                {
                    $currentDate: {
                        updatedAt: true
                    }
                }
            );
        }

        /**
         * ---------------------------------------------------------
         * 10. Return response
         * ---------------------------------------------------------
         */

        return {
            success: true,

            taskId,

            questionId:
                String((newQuestion as any)._id || ''),

            questionCount:
                questionCount + 1
        };

    } catch (error: any) {

        console.error(
            `Error adding question to task ${taskId}:`,
            error?.message || error
        );

        return {
            success: false
        };
    }
};

/**
 * Escape special regex characters.
 */
const escapeRegExp = (
    value: string
): string => {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );
};

export default {
    addCourseTaskQuestion
};
