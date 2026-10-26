import mongoose from 'mongoose';
import CourseModel from '../../model/coursesModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import { COURSE_CLONE_ERROR_CODES, COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';
import { ICloneCourseData, ICloneCourseInput, ICloneCourseResponse, IClonedCourseModule, ICloneTracker, IResolvedModuleSelection } from '../../interfaces/cloneCourse';

const ACTIVE_STATUS = 'ACTIVE';
const ARCHIVE_STATUS = 'ARCHIVE';

const buildUniqueName = (baseName: string, usedNames: Set<string>): string => {
    const base = String(baseName ?? '').trim() || 'Untitled';
    let candidate = base;
    let counter = 1;

    while (usedNames.has(candidate)) {
        counter += 1;
        candidate = `${base} (Copy${counter > 2 ? ` ${counter - 1}` : ''})`;
    }

    usedNames.add(candidate);
    return candidate;
};

const isDuplicateCourseNameError = (error: any): boolean => {
    if (!error) {
        return false;
    }

    if (error.code === 11000) {
        return (
            error?.keyPattern?.courseName === 1 ||
            error?.keyValue?.courseName !== undefined ||
            /courseName/i.test(String(error?.message || ''))
        );
    }

    const courseNameValidationError = error?.errors?.courseName;

    if (courseNameValidationError) {
        const kind =
            courseNameValidationError.kind ??
            courseNameValidationError.properties?.kind;

        const message =
            courseNameValidationError.message ??
            courseNameValidationError.properties?.message;

        return (
            kind === 'unique' ||
            /unique|already exists|duplicate/i.test(String(message || ''))
        );
    }

    return (
        /courseName/i.test(String(error?.message || '')) &&
        /unique|already exists|duplicate/i.test(String(error?.message || ''))
    );
};

const failure = ( code: string, message: string): ICloneCourseResponse => ({
    success: false,
    code,
    message
});

const performClone = async (courseName: string, sourceCourse: any, selections: IResolvedModuleSelection[], session: mongoose.ClientSession, tracker: ICloneTracker, existingModuleNames: string[], existingTaskNames: string[]): Promise<ICloneCourseData> => {
    const options = { session };

    const usedModuleNames = new Set<string>(existingModuleNames);
    const usedTaskNames = new Set<string>(existingTaskNames);

    const newCourse: any = new CourseModel({
        courseName,
        courseDescription: sourceCourse.courseDescription,
        thumbnail: sourceCourse.thumbnail,
        status: ACTIVE_STATUS
    });

    await newCourse.save(options);
    tracker.courseId = newCourse._id;

    const clonedModules: IClonedCourseModule[] = [];

    for (const [
        moduleIndex,
        { sourceModule, sourceTasks }
    ] of selections.entries()) {
        const newModule: any = new CourseModuleModel({
            moduleName: buildUniqueName(
                sourceModule.moduleName,
                usedModuleNames
            ),
            moduleDescription: sourceModule.moduleDescription,
            courseId: newCourse._id,
            thumbnail: sourceModule.thumbnail,
            status: sourceModule.status || ACTIVE_STATUS,
            orderIdx: sourceModule.orderIdx ?? moduleIndex + 1
        });

        await newModule.save(options);
        tracker.moduleIds.push(newModule._id);

        const clonedTasks = [];

        for (const [taskIndex, sourceTask] of sourceTasks.entries()) {
            const newTask: any = new CourseTaskModel({
                moduleId: newModule._id,
                taskName: buildUniqueName(
                    sourceTask.taskName,
                    usedTaskNames
                ),
                taskDescription: sourceTask.taskDescription,
                thumbnail: sourceTask.thumbnail,
                status: sourceTask.status || ACTIVE_STATUS,
                type: sourceTask.type,
                executionMode: sourceTask.executionMode,
                content: sourceTask.content,
                contentMimeType: sourceTask.contentMimeType,
                contentFileName: sourceTask.contentFileName,
                acknowledgementText: sourceTask.acknowledgementText,
                baseBoilerplate: sourceTask.baseBoilerplate,
                boilerplateVersion: sourceTask.boilerplateVersion,
                orderIdx: sourceTask.orderIdx ?? taskIndex + 1,
                starterCode: Array.isArray(sourceTask.starterCode)
                    ? sourceTask.starterCode.map((starter: any) => ({
                          languageId: starter.languageId,
                          code: starter.code
                      }))
                    : undefined
            });

            await newTask.save(options);
            tracker.taskIds.push(newTask._id);

            clonedTasks.push({
                taskId: String(newTask._id),
                taskName: newTask.taskName,
                type: newTask.type,
                status: newTask.status
            });
        }

        clonedModules.push({
            moduleId: String(newModule._id),
            moduleName: newModule.moduleName,
            status: newModule.status,
            tasks: clonedTasks
        });
    }

    return {
        courseId: String(newCourse._id),
        courseName: newCourse.courseName,
        status: newCourse.status,
        modules: clonedModules
    };
};

const cloneCourse = async (input: ICloneCourseInput): Promise<ICloneCourseResponse> => {
    const { courseId, courseName, modules } = input;

    let session: mongoose.ClientSession | null = null;

    try {
        // 1. Validate the source course.
        const sourceCourse = await CourseModel.findById(courseId);

        if (!sourceCourse) {
            return failure(
                COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND,
                COURSE_ERROR_MESSAGES.COURSE_CLONE_SOURCE_NOT_FOUND_MESSAGE
            );
        }

        if (
            (sourceCourse.status || '').toUpperCase() !== ARCHIVE_STATUS
        ) {
            return failure(
                COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED,
                COURSE_ERROR_MESSAGES.COURSE_CLONE_SOURCE_NOT_ARCHIVED_MESSAGE
            );
        }

        // 2. Validate the course name before creating any records.
        const normalizedCourseName = String(courseName ?? '').trim();

        const existingCourseWithSameName = await CourseModel.findOne({
            courseName: normalizedCourseName
        });

        if (existingCourseWithSameName) {
            return failure(
                COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME,
                COURSE_ERROR_MESSAGES.COURSE_CLONE_DUPLICATE_NAME_MESSAGE
            );
        }

        // 3. Validate selected modules belong to the source course.
        const requestedModuleIds = modules.map(
            (module) => module.moduleId
        );

        const uniqueModuleIds = Array.from(
            new Set(requestedModuleIds)
        );

        const sourceModules = await CourseModuleModel.find({
            _id: { $in: uniqueModuleIds },
            courseId: sourceCourse._id
        });

        const sourceModuleMap = new Map<string, any>(
            sourceModules.map((module: any) => [
                String(module._id),
                module
            ])
        );

        if (
            uniqueModuleIds.some(
                (id) => !sourceModuleMap.has(String(id))
            )
        ) {
            return failure(
                COURSE_CLONE_ERROR_CODES.INVALID_MODULE,
                COURSE_ERROR_MESSAGES.COURSE_CLONE_INVALID_MODULE_MESSAGE
            );
        }

        // 4. Validate selected tasks belong to their selected modules.
        const requestedTaskIds = modules.flatMap(
            (module) => module.taskIds
        );

        const sourceTasks = requestedTaskIds.length
            ? await CourseTaskModel.find({
                  _id: { $in: requestedTaskIds }
              })
            : [];

        const sourceTaskMap = new Map<string, any>(
            sourceTasks.map((task: any) => [
                String(task._id),
                task
            ])
        );

        const selections: IResolvedModuleSelection[] = [];

        for (const moduleSelection of modules) {
            const sourceModule = sourceModuleMap.get(
                String(moduleSelection.moduleId)
            );

            const resolvedTasks = moduleSelection.taskIds.map(
                (taskId) => {
                    const sourceTask = sourceTaskMap.get(
                        String(taskId)
                    );

                    if (
                        !sourceTask ||
                        String(sourceTask.moduleId) !==
                            String(sourceModule._id)
                    ) {
                        return null;
                    }

                    return sourceTask;
                }
            );

            if (resolvedTasks.some((task) => task === null)) {
                return failure(
                    COURSE_CLONE_ERROR_CODES.INVALID_TASK,
                    COURSE_ERROR_MESSAGES.COURSE_CLONE_INVALID_TASK_MESSAGE
                );
            }

            selections.push({
                sourceModule,
                sourceTasks: resolvedTasks as any[]
            });
        }
        
        const [existingModuleNames, existingTaskNames] =
            await Promise.all([
                CourseModuleModel.distinct('moduleName', {}),
                CourseTaskModel.distinct('taskName', {})
            ]);

        // 6. Start a transaction for all clone writes.
        session = await mongoose.startSession();
        session.startTransaction();

        const tracker: ICloneTracker = {
            moduleIds: [],
            taskIds: []
        };

        const data = await performClone(
            normalizedCourseName,
            sourceCourse,
            selections,
            session,
            tracker,
            existingModuleNames as string[],
            existingTaskNames as string[]
        );

        await session.commitTransaction();

        return {
            success: true,
            data
        };
    } catch (error: any) {
        // Abort only if a transaction is still active.
        if (session?.inTransaction()) {
            try {
                await session.abortTransaction();
            } catch (abortError: any) {
                console.error(
                    'Error aborting clone transaction:',
                    abortError
                );
            }
        }

        if (isDuplicateCourseNameError(error)) {
            return failure(
                COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME,
                COURSE_ERROR_MESSAGES.COURSE_CLONE_DUPLICATE_NAME_MESSAGE
            );
        }

        console.error('Error cloning course:', error);

        return failure(
            COURSE_CLONE_ERROR_CODES.CLONE_FAILED,
            COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
        );
    } finally {
        if (session) {
            try {
                await session.endSession();
            } catch (endError: any) {
                console.error(
                    'Error ending clone session:',
                    endError
                );
            }
        }
    }
};

export default { cloneCourse };
