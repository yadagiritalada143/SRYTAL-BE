
import mongoose from 'mongoose';
import CourseModel from '../../model/coursesModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import {
    COURSE_CLONE_ERROR_CODES,
    COURSE_ERROR_MESSAGES
} from '../../constants/contentwriter/courseMessages';
import {
    ICloneCourseData,
    ICloneCourseInput,
    ICloneCourseResponse,
    IClonedCourseModule,
    IResolvedModuleSelection,
} from '../../interfaces/cloneCourse';

const ACTIVE_STATUS = 'ACTIVE';
const ARCHIVE_STATUS = 'ARCHIVE';

const buildUniqueName = (
    baseName: string,
    usedNames: Set<string>
): string => {
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

const saveOptions = (session: mongoose.ClientSession | null) =>
    session ? { session } : {};

/**
 * Detect duplicate-key errors specifically for the courseName field.
 */
const isDuplicateCourseNameError = (error: any): boolean => {
    if (error?.code !== 11000) {
        return false;
    }

    return (
        error?.keyPattern?.courseName === 1 ||
        error?.keyValue?.courseName !== undefined ||
        /courseName/i.test(String(error?.message || ''))
    );
};


const failure = (
    code: string,
    message: string
): ICloneCourseResponse => ({
    success: false,
    code,
    message
});

/**
 * Create the course, selected modules, and selected tasks.
 */
const performClone = async (
    courseName: string,
    sourceCourse: any,
    selections: IResolvedModuleSelection[],
    session: mongoose.ClientSession | null,
): Promise<ICloneCourseData> => {
     const options = saveOptions(session);

    const [existingModuleNames, existingTaskNames] = await Promise.all([
        CourseModuleModel.distinct('moduleName', {}, options),
        CourseTaskModel.distinct('taskName', {}, options)
    ]);

    const usedModuleNames = new Set<string>(
        existingModuleNames as string[]
    );

    const usedTaskNames = new Set<string>(
        existingTaskNames as string[]
    );

    const newCourse: any = new CourseModel({
        courseName,
        courseDescription: sourceCourse.courseDescription,
        thumbnail: sourceCourse.thumbnail,
        status: ACTIVE_STATUS
    });

     await newCourse.save(options);


    const clonedModules: IClonedCourseModule[] = [];

    for (const { sourceModule, sourceTasks } of selections) {
        const newModule: any = new CourseModuleModel({
            moduleName: buildUniqueName(
                sourceModule.moduleName,
                usedModuleNames
            ),
            moduleDescription: sourceModule.moduleDescription,
            courseId: newCourse._id,
            thumbnail: sourceModule.thumbnail,
            status: sourceModule.status || ACTIVE_STATUS
        });

         await newModule.save(options);

        const clonedTasks = [];

        for (const sourceTask of sourceTasks) {
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
                starterCode: Array.isArray(sourceTask.starterCode)
                    ? sourceTask.starterCode.map((starter: any) => ({
                          languageId: starter.languageId,
                          code: starter.code
                      }))
                    : undefined
            });

            await newTask.save(options);

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

const cloneCourse = async (
    input: ICloneCourseInput
): Promise<ICloneCourseResponse> => {
    const { courseId, courseName, modules } = input;

    try {
        // 1. Validate the source course.
        const sourceCourse = await CourseModel.findById(courseId);

        if (!sourceCourse) {
            return failure(
                COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND,
                COURSE_ERROR_MESSAGES
                    .COURSE_CLONE_SOURCE_NOT_FOUND_MESSAGE
            );
        }

        if (
            (sourceCourse.status || '').toUpperCase() !== ARCHIVE_STATUS
        ) {
            return failure(
                COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED,
                COURSE_ERROR_MESSAGES
                    .COURSE_CLONE_SOURCE_NOT_ARCHIVED_MESSAGE
            );
        }

        // 2. Validate the course name before creating any records.
        const normalizedCourseName = String(courseName ?? '').trim();

const existingCourseWithSameName = await CourseModel.findOne({ courseName: normalizedCourseName})

if (existingCourseWithSameName) {
    return failure(
        COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME,
        COURSE_ERROR_MESSAGES.COURSE_CLONE_DUPLICATE_NAME_MESSAGE
    );
}

        // 3. Validate that selected modules belong to the source course.
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

        // 4. Validate that selected tasks belong to their selected modules.
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

       // 5. Clone course, modules, and tasks inside a transaction.
let session: mongoose.ClientSession | null = null;

try {
    session = await mongoose.startSession();
    session.startTransaction();



    const data = await performClone(
        normalizedCourseName,
        sourceCourse,
        selections,
        session,
    );

    await session.commitTransaction();

    return {
        success: true,
        data
    };
} catch (transactionError: any) {
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

    if (isDuplicateCourseNameError(transactionError)) {
        return failure(
            COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME,
            COURSE_ERROR_MESSAGES.COURSE_DUPLICATE_NAME_MESSAGE
        );
    }

    console.error(
        'Error cloning course:',
        transactionError
    );

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

    } catch (error: any) {
        // Handle duplicate-key errors that occur outside the inner try blocks.
        if (isDuplicateCourseNameError(error)) {
            return failure(
                COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME,
                COURSE_ERROR_MESSAGES
                    .COURSE_CLONE_DUPLICATE_NAME_MESSAGE
            );
        }

        console.error('Error in cloning course:', error);

        return failure(
            COURSE_CLONE_ERROR_CODES.CLONE_FAILED,
            COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
        );
    }
};

export default { cloneCourse };
