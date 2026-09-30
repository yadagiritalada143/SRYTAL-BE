import TaskProgressModel from '../model/taskProgressModel';
import CodeRunModel from '../model/codeRunModel';
import CourseAssignment from '../model/courseAssignmentModel';
import courseProgress from './manageCourseProgress';
import notifyAdminOnCourseCompletion from './notifyAdminOnCourseCompletion';
import { resolveQuestions, isQuestionActive } from './courseTaskQuestions';
import { COURSE_ASSIGNMENT_STATUS } from '../types/courseAssignmentStatusValues';

/**
 * A question counts as solved only once the employee has a final submission for
 * it that passed every test case. Run Code is deliberately excluded: iterating on
 * a failing answer must never move progress.
 */
const SOLVED_SUBMISSION_TYPE = 'submit';
const SOLVED_SUBMISSION_STATUS = 'ALL_PASSED';

export interface ITaskCompletionState {
    isCompleted: boolean;
    activeQuestionCount: number;
    completedQuestionCount: number;
}

export interface IAssignmentProgress {
    courseStatus: string;
    progress: { totalTasks: number; completedTasks: number; percentComplete: number };
}

/**
 * Re-derives the assignment status (Assigned -> In Progress -> Completed) from
 * the task-progress rows and notifies the assigning admin on the transition into
 * Completed. Shared by the employee self-tick endpoint and by the derived coding
 * completion below, so the status can never disagree with the progress rows.
 */
export const refreshAssignmentCompletion = async (assignment: any): Promise<IAssignmentProgress> => {
    const [modulesByCourse, completedByAssignment] = await Promise.all([
        courseProgress.getActiveModulesByCourse([String(assignment.courseId)]),
        courseProgress.getCompletedTaskIds([String(assignment._id)])
    ]);

    const courseModules = modulesByCourse.get(String(assignment.courseId)) || [];
    const tasksByModule = await courseProgress.getActiveTasksByModule(
        courseModules.map((module: any) => String(module._id))
    );

    const modules = courseProgress.buildCourseModules(
        courseModules,
        tasksByModule,
        completedByAssignment.get(String(assignment._id)) || new Map()
    );
    const progress = courseProgress.summariseProgress(modules);
    const courseStatus = courseProgress.deriveAssignmentStatus(
        progress.completedTasks,
        progress.totalTasks
    );

    const nowCompleted =
        courseStatus === COURSE_ASSIGNMENT_STATUS.COMPLETED &&
        assignment.status !== COURSE_ASSIGNMENT_STATUS.COMPLETED;

    await CourseAssignment.updateOne(
        { _id: assignment._id },
        {
            $set: {
                status: courseStatus,
                completedAt:
                    courseStatus === COURSE_ASSIGNMENT_STATUS.COMPLETED
                        ? assignment.completedAt || new Date()
                        : null
            }
        }
    );

    if (nowCompleted) {
        console.log(`[CourseCompletion] Transition to Completed detected for assignment ${assignment._id} (employee ${assignment.employeeId}); dispatching admin notification.`);
        void notifyAdminOnCourseCompletion.notifyAdminOnCourseCompletion(
            assignment,
            courseStatus === COURSE_ASSIGNMENT_STATUS.COMPLETED
                ? assignment.completedAt || new Date()
                : new Date()
        );
    } else {
        console.log(`[CourseCompletion] No completion transition (status=${courseStatus}, previous=${assignment.status}); no email sent.`);
    }

    return { courseStatus, progress };
};


/**
 * How many of a task's active questions this employee has already passed. Reads
 * the passed submissions once and intersects them with the task's active
 * question ids, so a question that was archived after being solved no longer
 * counts towards completion.
 */
const countCompletedQuestions = async (
    taskId: string,
    employeeId: string,
    activeQuestionIds: string[]
): Promise<number> => {
    if (activeQuestionIds.length === 0) {
        return 0;
    }

    const passed: any[] = await CodeRunModel.distinct('questionId', {
        userId: employeeId,
        taskId,
        type: SOLVED_SUBMISSION_TYPE,
        status: SOLVED_SUBMISSION_STATUS
    });

    const passedIds = new Set((passed || []).map((questionId: any) => String(questionId)));
    return activeQuestionIds.filter((questionId) => passedIds.has(questionId)).length;
};

/**
 * Task-level completion for a coding task, derived rather than stored: the task
 * is complete only once every one of its active questions has a passing final
 * submission. There is deliberately no question-level progress row - the single
 * task-progress record stays the source of truth for the course denominator.
 *
 * Called after a submission is persisted. Never throws: progress bookkeeping must
 * not turn a valid submission into a failed request.
 */
export const syncTaskCompletionFromSubmissions = async (options: {
    task: any;
    moduleId: string;
    assignment: any;
    employeeId: string;
}): Promise<ITaskCompletionState> => {
    const { task, moduleId, assignment, employeeId } = options;
    const taskId = String(task._id);

    const activeQuestionIds = resolveQuestions(task)
        .filter(isQuestionActive)
        .map((question) => String(question.questionId));

    // A coding task with no published questions can never be completed, and is
    // kept out of the course denominator (see manageCourseProgress) so a writer
    // can still add questions to it later.
    if (activeQuestionIds.length === 0) {
        return { isCompleted: false, activeQuestionCount: 0, completedQuestionCount: 0 };
    }

    try {
        const completedQuestionCount = await countCompletedQuestions(taskId, employeeId, activeQuestionIds);
        const isCompleted = completedQuestionCount >= activeQuestionIds.length;

        const existing: any = await TaskProgressModel.findOne({
            courseAssignmentId: assignment._id,
            moduleId,
            taskId
        }).lean();

        const wasCompleted = Boolean(existing && existing.isCompleted);

        // Only write on a real transition, so a repeat submission does not
        // re-stamp completedAt or re-fire the course-completion notification.
        if (wasCompleted !== isCompleted) {
            await TaskProgressModel.findOneAndUpdate(
                { courseAssignmentId: assignment._id, moduleId, taskId },
                { $set: { isCompleted, completedAt: isCompleted ? new Date() : null } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        if (isCompleted && !wasCompleted) {
            await refreshAssignmentCompletion(assignment);
        }

        return {
            isCompleted,
            activeQuestionCount: activeQuestionIds.length,
            completedQuestionCount
        };
    } catch (error: any) {
        console.error(`Error syncing task completion for task ${taskId}: ${error?.message || error}`);
        return {
            isCompleted: false,
            activeQuestionCount: activeQuestionIds.length,
            completedQuestionCount: 0
        };
    }
};

export default { refreshAssignmentCompletion, syncTaskCompletionFromSubmissions };
