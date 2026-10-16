import { Types } from 'mongoose';
import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import TaskProgressModel from '../../model/taskProgressModel';
import quizConfig from '../../config/quizConfig';
import { IQuizAnswerSubmission, IQuizReviewQuestion, IValidateQuizResponse } from '../../interfaces/myCourses';

const SINGLE_SELECT_TYPES = ['RADIO', 'DROPDOWN', 'TOGGLE'];

const buildOptionIdToIndex = (options: any[]): Map<string, number> => {
    const map = new Map<string, number>();
    (options || []).forEach((option: any, index: number) => {
        const optionId = option && option._id != null ? String(option._id) : `opt-${index}`;
        map.set(optionId, index);
    });
    return map;
};

const sameIdSet = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    const setA = new Set(a);
    return b.every(id => setA.has(id));
};

const gradeOptionQuestion = (
    type: string,
    correctIndexes: number[],
    selectedIndexes: number[]
): boolean => {
    if (selectedIndexes.length === 0) {
        return false;
    }

    if (type === 'CHECKBOX') {
        return sameIdSet(
            selectedIndexes.map(String),
            correctIndexes.map(String)
        );
    }

    return (
        correctIndexes.length === 1 &&
        selectedIndexes.length === 1 &&
        selectedIndexes[0] === correctIndexes[0]
    );
};

const validateQuiz = async (
    taskId: string,
    attemptId: string,
    answers: IQuizAnswerSubmission[],
    employeeId: string
): Promise<IValidateQuizResponse> => {
    if (!taskId || !Types.ObjectId.isValid(taskId)) {
        return { success: false, invalidTaskId: true };
    }

    if (!attemptId || !Types.ObjectId.isValid(attemptId)) {
        return { success: false, invalidAttemptId: true };
    }

    if (!Array.isArray(answers)) {
        return { success: false, invalidAnswers: true };
    }

    try {
        const task: any = await CourseTaskModel.findById(taskId)
            .select('moduleId type')
            .lean();

        if (!task) {
            return { success: false, taskNotFound: true };
        }

        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        const parentModule: any = await CourseModuleModel.findById(task.moduleId)
            .select('courseId')
            .lean();

        if (!parentModule || !parentModule.courseId) {
            return { success: false, notFound: true };
        }

        const assignment: any = await CourseAssignment.findOne({
            courseId: parentModule.courseId,
            employeeId
        }).lean();

        if (!assignment) {
            return { success: false, notFound: true };
        }

        const progress: any = await TaskProgressModel.findOne({
            courseAssignmentId: assignment._id,
            moduleId: parentModule._id,
            taskId
        })
            .select('quizAttempts')
            .lean();

        const attempt = (progress?.quizAttempts || []).find(
            (entry: any) => String(entry._id) === String(attemptId)
        );

        if (!attempt) {
            return { success: false, attemptNotFound: true };
        }

        if (attempt.submittedAt) {
            return { success: false, attemptAlreadyFinalized: true };
        }

        const storedQuestions: any[] = await CourseQuizQuestionModel.find({
            taskId,
            isDeleted: false,
            status: 'SHOW'
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();

        const questionsById = new Map<string, any>(
            storedQuestions.map((question: any) => [String(question._id), question])
        );

        const seenQuestionIds = new Set<string>();
        const submittedByQuestionId = new Map<string, IQuizAnswerSubmission>();

        for (const answer of answers) {
            const questionId = String(answer?.questionId || '');

            if (!Types.ObjectId.isValid(questionId)) {
                return { success: false, invalidAnswers: true };
            }

            if (seenQuestionIds.has(questionId)) {
                return { success: false, invalidAnswers: true };
            }
            seenQuestionIds.add(questionId);

            const question = questionsById.get(questionId);

            if (!question) {
                return { success: false, invalidAnswers: true };
            }

            const type = String(question.type || '').toUpperCase();
            const isTextarea = type === 'TEXTAREA';
            const selected = answer.selectedOptionIds;
            const textAnswer = answer.textAnswer;

            if (isTextarea) {
                if (
                    (selected !== undefined && !Array.isArray(selected)) ||
                    (Array.isArray(selected) && selected.length > 0) ||
                    (textAnswer !== undefined && typeof textAnswer !== 'string')
                ) {
                    return { success: false, invalidAnswers: true };
                }
            } else {
                if (textAnswer !== undefined) {
                    return { success: false, invalidAnswers: true };
                }

                if (selected !== undefined && !Array.isArray(selected)) {
                    return { success: false, invalidAnswers: true };
                }

                const selectedIds: string[] = Array.isArray(selected) ? selected : [];

                if (selectedIds.some(id => typeof id !== 'string' || !id)) {
                    return { success: false, invalidAnswers: true };
                }

                const optionIdToIndex = buildOptionIdToIndex(question.options);
                const resolvedIndexes: number[] = [];

                for (const optionId of selectedIds) {
                    const optionIndex = optionIdToIndex.get(optionId);

                    if (optionIndex === undefined) {
                        return { success: false, invalidAnswers: true };
                    }
                    resolvedIndexes.push(optionIndex);
                }

                // No option may be selected twice.
                if (new Set(resolvedIndexes).size !== resolvedIndexes.length) {
                    return { success: false, invalidAnswers: true };
                }

                if (
                    SINGLE_SELECT_TYPES.includes(type) &&
                    resolvedIndexes.length > 1
                ) {
                    return { success: false, invalidAnswers: true };
                }
            }

            submittedByQuestionId.set(questionId, answer);
        }

        const review: IQuizReviewQuestion[] = [];
        let totalScoredQuestions = 0;
        let correctAnswers = 0;

        for (const question of storedQuestions) {
            const questionId = String(question._id);
            const type = String(question.type || '').toUpperCase();
            const submitted = submittedByQuestionId.get(questionId);

            if (type === 'TEXTAREA') {
                review.push({
                    questionId,
                    question: question.question,
                    type,
                    isCorrect: null,
                    textAnswer: submitted?.textAnswer ?? ''
                });
                continue;
            }

            totalScoredQuestions += 1;

            const options: any[] = Array.isArray(question.options) ? question.options : [];
            const optionIdToIndex = buildOptionIdToIndex(options);
            const correctIndexes: number[] = [];
            options.forEach((option: any, index: number) => {
                if (option && option.isanswer === true) {
                    correctIndexes.push(index);
                }
            });

            const selectedIds: string[] =
                Array.isArray(submitted?.selectedOptionIds) ? submitted!.selectedOptionIds! : [];
            const selectedIndexes = selectedIds.map(id => optionIdToIndex.get(id)!);

            const isCorrect = gradeOptionQuestion(type, correctIndexes, selectedIndexes);

            if (isCorrect) {
                correctAnswers += 1;
            }

            review.push({
                questionId,
                question: question.question,
                type,
                isCorrect,
                correctOptionIds: correctIndexes.map(index =>
                    options[index] && options[index]._id != null
                        ? String(options[index]._id)
                        : `opt-${index}`
                ),
                correctOptionValues: correctIndexes.map(index => options[index]?.value ?? ''),
                selectedOptionIds: selectedIds,
                selectedOptionValues: selectedIndexes.map(index => options[index]?.value ?? '')
            });
        }

        const passingPercentage = quizConfig.getQuizPassingPercentage();

        const percentage =
            totalScoredQuestions > 0
                ? Math.round((correctAnswers / totalScoredQuestions) * 100)
                : null;
        const passed = percentage === null ? null : percentage >= passingPercentage;

        const now = new Date();
        const updateResult = await TaskProgressModel.updateOne(
            { _id: progress._id },
            {
                $set: {
                    'quizAttempts.$[attempt].validatedAt': now,
                    'quizAttempts.$[attempt].totalScoredQuestions': totalScoredQuestions,
                    'quizAttempts.$[attempt].correctAnswers': correctAnswers,
                    'quizAttempts.$[attempt].percentage': percentage,
                    'quizAttempts.$[attempt].passed': passed
                }
            },
            {
                arrayFilters: [
                    { 'attempt._id': attemptId, 'attempt.submittedAt': null }
                ]
            }
        );

        if (!updateResult || updateResult.modifiedCount === 0) {
            return { success: false, attemptAlreadyFinalized: true };
        }

        return {
            success: true,
            taskId,
            attemptId,
            totalScoredQuestions,
            correctAnswers,
            incorrectAnswers: totalScoredQuestions - correctAnswers,
            percentage,
            passingPercentage,
            passed,
            review
        };
    } catch (error: any) {
        console.error(`Error in validating quiz for task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { validateQuiz };
