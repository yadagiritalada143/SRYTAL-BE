/**
 * Response shapes for the employee-facing ("my courses") endpoints. These are
 * plain view models assembled in the services — they are deliberately not the
 * raw mongoose documents, so the employee never receives S3 object keys or
 * other authoring-only fields.
 */

export interface IMyCourseTask {
    _id: string;
    taskName: string;
    taskDescription: string;
    status?: string;
    // 'FILE' (streamed from S3 through the content proxy) or 'LINK'.
    type?: string;
    // Only populated for 'LINK' tasks — the external URL. 'FILE' content stays
    // server-side and is reached through /contentwriter/getCourseTaskContent.
    link?: string;
    contentMimeType?: string;
    contentFileName?: string;
    // A coding task holds its own questions and is completed by the server once
    // every one of them has a passing submission, never by the client.
    isCoding?: boolean;
    // Published questions on the task, and how many the employee has solved.
    questionCount?: number;
    completedQuestionCount?: number;
    // Acknowledgement only applies to 'FILE' tasks. The text is the task's
    // shared acknowledgement copy, followed by this employee's state.
    acknowledgementText?: string;
    acknowledged?: boolean;
    acknowledgedAt?: Date | null;
    isCompleted: boolean;
    completedAt?: Date | null;
}

export interface IMyCourseModule {
    _id: string;
    moduleName: string;
    moduleDescription: string;
    status?: string;
    tasks: IMyCourseTask[];
    totalTasks: number;
    completedTasks: number;
}

export interface IMyCourseProgress {
    totalTasks: number;
    completedTasks: number;
    // Whole-number percentage (0-100).
    percentComplete: number;
}

export interface IMyAssignedCourseSummary {
    courseAssignmentId: string;
    courseId: string;
    courseName: string;
    courseDescription: string;
    thumbnailUrl: string;
    status: string;
    assignedAt: Date;
    dueDate: Date;
    completedAt?: Date | null;
    isOverdue: boolean;
    totalModules: number;
    progress: IMyCourseProgress;
}

export interface IMyAssignedCourseDetail extends IMyAssignedCourseSummary {
    modules: IMyCourseModule[];
}

export interface IFetchMyAssignedCoursesResponse {
    success: boolean;
    courses: IMyAssignedCourseSummary[];
}

export interface IFetchMyAssignedCourseByIdResponse {
    success: boolean;
    course?: IMyAssignedCourseDetail;
}

export interface IUpdateMyTaskProgressResponse {
    success: boolean;
    // Set when the assignment could not be found for this employee.
    notFound?: boolean;
    // Set when the task is not part of the assigned course.
    invalidTask?: boolean;
    // Set when the task is a coding task. Its completion is derived by the server
    // from passing submissions, so the employee cannot tick it off by hand.
    isCodingTask?: boolean;
    courseStatus?: string;
    progress?: IMyCourseProgress;
    task?: { taskId: string; isCompleted: boolean; completedAt?: Date | null };
}

export interface IUpdateMyTaskAcknowledgementResponse {
    success: boolean;
    // Set when the assignment could not be found for this employee.
    notFound?: boolean;
    // Set when the task does not belong to the assigned course.
    invalidTask?: boolean;
    // Set when the task is not a FILE task. Acknowledgement only applies to
    // file-based tasks.
    notFileTask?: boolean;
    // Set when the client tries to revoke an acknowledgement with acknowledged: false.
    revocationNotAllowed?: boolean;
    courseAssignmentId?: string;
    taskId?: string;
    acknowledged?: boolean;
    acknowledgedAt?: Date | null;
}

/**
 * Employee-facing quiz view models. Options never carry `isanswer` (or any
 * other correct-answer hint): optionId is a stable identifier derived from the
 * option's position in the persisted question, so the employee can answer by
 * id even though the displayed order is shuffled per attempt.
 */
export interface IQuizQuestionOption {
    optionId: string;
    value: string;
}

export interface IQuizQuestion {
    questionId: string;
    question: string;
    type: string;
    // Only present for option-based questions; TEXTAREA questions are free
    // text and never carry artificial options.
    options?: IQuizQuestionOption[];
}

export interface IFetchQuizByIdResponse {
    success: boolean;
    // Set when the taskId is not a valid ObjectId.
    invalidTaskId?: boolean;
    // Set when the task does not exist.
    taskNotFound?: boolean;
    // Set when the task exists but is not of type QUIZ.
    notQuizTask?: boolean;
    // Set when the task exists but is not ACTIVE.
    taskInactive?: boolean;
    // Set when the employee has no course assignment covering this task (or
    // the assigned course is archived).
    notFound?: boolean;
    taskId?: string;
    // The identifier of the attempt started by this fetch. Only minted when
    // the quiz has at least one visible question.
    attemptId?: string;
    taskName?: string;
    totalQuestions?: number;
    questions?: IQuizQuestion[];
}

/**
 * One submitted answer in a validateQuiz payload. Option-based questions carry
 * `selectedOptionIds` (stable ids as handed out by getQuizById); TEXTAREA
 * questions carry `textAnswer`.
 */
export interface IQuizAnswerSubmission {
    questionId: string;
    selectedOptionIds?: string[];
    textAnswer?: string;
}

/**
 * Per-question review entry returned by validateQuiz. Once the employee has
 * submitted answers for checking, the answer key is revealed in this response
 * (correctOptionIds/correctValues) — never in getQuizById.
 */
export interface IQuizReviewQuestion {
    questionId: string;
    question: string;
    type: string;
    // true/false for scored questions; null/absent for TEXTAREA (unscored).
    isCorrect?: boolean | null;
    // Answer key for option-based questions, revealed post-submission.
    correctOptionIds?: string[];
    correctOptionValues?: string[];
    // What the employee selected (empty array when unanswered).
    selectedOptionIds?: string[];
    selectedOptionValues?: string[];
    // Free-text response for TEXTAREA questions (unscored in this version).
    textAnswer?: string;
}

export interface IValidateQuizResponse {
    success: boolean;
    // Set when the taskId is not a valid ObjectId.
    invalidTaskId?: boolean;
    // Set when the attemptId is not a valid ObjectId.
    invalidAttemptId?: boolean;
    // Set when the answers payload is malformed: unknown/duplicate question
    // ids, option ids that do not belong to the question, selections on
    // TEXTAREA questions, text answers on option questions, or multiple
    // selections on single-select questions.
    invalidAnswers?: boolean;
    // Set when the task does not exist.
    taskNotFound?: boolean;
    // Set when the task exists but is not of type QUIZ.
    notQuizTask?: boolean;
    // Set when the employee has no course assignment covering this task.
    notFound?: boolean;
    // Set when the attemptId does not exist on this employee's progress row
    // for this task — an attempt can only be validated by the employee who
    // owns it.
    attemptNotFound?: boolean;
    // Set when the attempt has already been finalized through submitQuiz.
    // Finalized attempts are immutable; a new attempt must be started.
    attemptAlreadyFinalized?: boolean;
    taskId?: string;
    attemptId?: string;
    // Scored (non-TEXTAREA) questions only — TEXTAREA is excluded from the
    // denominator. Zero means the quiz had nothing scorable; percentage and
    // passed are then null rather than NaN.
    totalScoredQuestions?: number;
    correctAnswers?: number;
    incorrectAnswers?: number;
    percentage?: number | null;
    passingPercentage?: number;
    // null when the quiz is unscored (no scored questions).
    passed?: boolean | null;
    review?: IQuizReviewQuestion[];
}

