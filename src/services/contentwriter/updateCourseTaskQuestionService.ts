import { Types } from 'mongoose';
import CourseTaskModel from '../../model/courseTaskModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import CourseModel from '../../model/coursesModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import { IUpdateCourseTaskQuestionResponse } from '../../interfaces/courseTask';

/**
 * Updates one coding question belonging to a course task.
 *
 * Questions are stored in the separate TaskCodingQuestionModel
 * collection.
 *
 * Only the question identified by taskId + questionId is updated.
 */
const updateCourseTaskQuestion = async (
    input: {
        taskId: string;
        questionId: string;
        question?: string;
        description?: string;
        status?: string;
    }
): Promise<IUpdateCourseTaskQuestionResponse> => {
    const taskId = String(input.taskId || '').trim();
    const questionId = String(input.questionId || '').trim();

    try {
        /** * ---------------------------------------------------------
         * 1. Validate IDs
         * --------------------------------------------------------- */
        if (
            !Types.ObjectId.isValid(taskId) ||
            !Types.ObjectId.isValid(questionId)
        ) {
            return {
                success: false,
                questionNotFound: true
            };
        }

        /** * ---------------------------------------------------------
         * 2. Find task
         * --------------------------------------------------------- */
        const task = await CourseTaskModel
            .findById(taskId)
            .select('_id isCoding moduleId')
            .lean();

        if (!task) {
            return {
                success: false,
                notFound: true
            };
        }

        /** * ---------------------------------------------------------
         * 3. Verify coding task
         * --------------------------------------------------------- */
        if (!task.isCoding) {
            return {
                success: false,
                notCodingTask: true
            };
        }

        /** * ---------------------------------------------------------
         * 4. Validate question text
         * --------------------------------------------------------- */
        // if (
        //     input.question !== undefined &&
        //     !String(input.question).trim()
        // ) {
        //     return {
        //         success: false,
        //         invalidQuestion: true
        //     };
        // }

        /** * ---------------------------------------------------------
         * 5. Find existing question
         *
         * taskId + questionId ensures that the question belongs
         * to this particular task.
         * --------------------------------------------------------- */
        const existingQuestion = await TaskCodingQuestionModel
            .findOne({
                _id: questionId,
                taskId
            })
            .lean();

        if (!existingQuestion) {
            return {
                success: false,
                questionNotFound: true
            };
        }

        /** * ---------------------------------------------------------
         * 6. Check duplicate question text
         *
         * Case-insensitive duplicate check within the same task.
         *
         * The current question itself is excluded using _id: $ne.
         * --------------------------------------------------------- */
        if (input.question !== undefined) {
            const normalizedQuestion = String(input.question).trim();

            const duplicateQuestion = await TaskCodingQuestionModel
                .findOne({
                    taskId,
                    _id: {
                        $ne: questionId
                    },
                    status: {
                        $ne: 'INACTIVE'
                    },
                    question: {
                        $regex: `^${escapeRegExp(normalizedQuestion)}$`,
                        $options: 'i'
                    }
                })
                .select('_id')
                .lean();

            if (duplicateQuestion) {
                return {
                    success: false,
                    duplicateQuestion: true
                };
            }
        }

        /** * ---------------------------------------------------------
         * 7. Build update fields
         * --------------------------------------------------------- */
        const updateFields: Record<string, unknown> = {};

        if (input.question !== undefined) {
            updateFields.question = String(input.question).trim();
        }

        if (input.description !== undefined) {
            updateFields.description = String(input.description);
        }

        if (input.status !== undefined) {
            const normalizedStatus = String(input.status)
                .trim()
                .toUpperCase();

            if (
                normalizedStatus !== 'ACTIVE' &&
                normalizedStatus !== 'INACTIVE'
            ) {
                return {
                    success: false
                };
            }

            updateFields.status = normalizedStatus;
        }

        /** * ---------------------------------------------------------
         * 8. Nothing to update
         * --------------------------------------------------------- */
        if (Object.keys(updateFields).length === 0) {
            return {
                success: true,
                taskId,
                questionId
            };
        }

        /** * ---------------------------------------------------------
         * 9. Update question
         * --------------------------------------------------------- */
        const updatedQuestion = await TaskCodingQuestionModel
            .findOneAndUpdate(
                {
                    _id: questionId,
                    taskId
                },
                {
                    $set: updateFields
                },
                {
                    new: true,
                    runValidators: true
                }
            )
            .lean();

        if (!updatedQuestion) {
            return {
                success: false,
                questionNotFound: true
            };
        }

        /** * ---------------------------------------------------------
         * 10. Update parent course timestamp
         *
         * Same behavior as addCourseTaskQuestion.
         * --------------------------------------------------------- */
        const module = await CourseModuleModel
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

        /** * ---------------------------------------------------------
         * 11. Return success
         * --------------------------------------------------------- */
        return {
            success: true,
            taskId,
            questionId
        };
    } catch (error: any) {
        console.error(
            `Error updating question ${questionId} of task ${taskId}:`,
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
    updateCourseTaskQuestion
};