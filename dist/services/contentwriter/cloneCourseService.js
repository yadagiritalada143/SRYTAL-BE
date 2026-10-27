"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const ACTIVE_STATUS = 'ACTIVE';
const ARCHIVE_STATUS = 'ARCHIVE';
const buildUniqueName = (baseName, usedNames) => {
    const base = String(baseName !== null && baseName !== void 0 ? baseName : '').trim() || 'Untitled';
    let candidate = base;
    let counter = 1;
    while (usedNames.has(candidate)) {
        counter += 1;
        candidate = `${base} (Copy${counter > 2 ? ` ${counter - 1}` : ''})`;
    }
    usedNames.add(candidate);
    return candidate;
};
const isDuplicateCourseNameError = (error) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!error) {
        return false;
    }
    if (error.code === 11000) {
        return (((_a = error === null || error === void 0 ? void 0 : error.keyPattern) === null || _a === void 0 ? void 0 : _a.courseName) === 1 ||
            ((_b = error === null || error === void 0 ? void 0 : error.keyValue) === null || _b === void 0 ? void 0 : _b.courseName) !== undefined ||
            /courseName/i.test(String((error === null || error === void 0 ? void 0 : error.message) || '')));
    }
    const courseNameValidationError = (_c = error === null || error === void 0 ? void 0 : error.errors) === null || _c === void 0 ? void 0 : _c.courseName;
    if (courseNameValidationError) {
        const kind = (_d = courseNameValidationError.kind) !== null && _d !== void 0 ? _d : (_e = courseNameValidationError.properties) === null || _e === void 0 ? void 0 : _e.kind;
        const message = (_f = courseNameValidationError.message) !== null && _f !== void 0 ? _f : (_g = courseNameValidationError.properties) === null || _g === void 0 ? void 0 : _g.message;
        return (kind === 'unique' ||
            /unique|already exists|duplicate/i.test(String(message || '')));
    }
    return (/courseName/i.test(String((error === null || error === void 0 ? void 0 : error.message) || '')) &&
        /unique|already exists|duplicate/i.test(String((error === null || error === void 0 ? void 0 : error.message) || '')));
};
const failure = (code, message) => ({
    success: false,
    code,
    message
});
const performClone = async (courseName, sourceCourse, selections, session, tracker, existingModuleNames, existingTaskNames) => {
    var _a, _b;
    const options = { session };
    const usedModuleNames = new Set(existingModuleNames);
    const usedTaskNames = new Set(existingTaskNames);
    const newCourse = new coursesModel_1.default({
        courseName,
        courseDescription: sourceCourse.courseDescription,
        thumbnail: sourceCourse.thumbnail,
        status: ACTIVE_STATUS
    });
    await newCourse.save(options);
    tracker.courseId = newCourse._id;
    const clonedModules = [];
    for (const [moduleIndex, { sourceModule, sourceTasks }] of selections.entries()) {
        const newModule = new coursemoduleModel_1.default({
            moduleName: buildUniqueName(sourceModule.moduleName, usedModuleNames),
            moduleDescription: sourceModule.moduleDescription,
            courseId: newCourse._id,
            thumbnail: sourceModule.thumbnail,
            status: sourceModule.status || ACTIVE_STATUS,
            orderIdx: (_a = sourceModule.orderIdx) !== null && _a !== void 0 ? _a : moduleIndex + 1
        });
        await newModule.save(options);
        tracker.moduleIds.push(newModule._id);
        const clonedTasks = [];
        for (const [taskIndex, sourceTask] of sourceTasks.entries()) {
            const newTask = new courseTaskModel_1.default({
                moduleId: newModule._id,
                taskName: buildUniqueName(sourceTask.taskName, usedTaskNames),
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
                orderIdx: (_b = sourceTask.orderIdx) !== null && _b !== void 0 ? _b : taskIndex + 1,
                starterCode: Array.isArray(sourceTask.starterCode)
                    ? sourceTask.starterCode.map((starter) => ({
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
const cloneCourse = async (input) => {
    const { courseId, courseName, modules } = input;
    let session = null;
    try {
        // 1. Validate the source course.
        const sourceCourse = await coursesModel_1.default.findById(courseId);
        if (!sourceCourse) {
            return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_SOURCE_NOT_FOUND_MESSAGE);
        }
        if ((sourceCourse.status || '').toUpperCase() !== ARCHIVE_STATUS) {
            return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_SOURCE_NOT_ARCHIVED_MESSAGE);
        }
        // 2. Validate the course name before creating any records.
        const normalizedCourseName = String(courseName !== null && courseName !== void 0 ? courseName : '').trim();
        const existingCourseWithSameName = await coursesModel_1.default.findOne({
            courseName: normalizedCourseName
        });
        if (existingCourseWithSameName) {
            return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_DUPLICATE_NAME_MESSAGE);
        }
        // 3. Validate selected modules belong to the source course.
        const requestedModuleIds = modules.map((module) => module.moduleId);
        const uniqueModuleIds = Array.from(new Set(requestedModuleIds));
        const sourceModules = await coursemoduleModel_1.default.find({
            _id: { $in: uniqueModuleIds },
            courseId: sourceCourse._id
        });
        const sourceModuleMap = new Map(sourceModules.map((module) => [
            String(module._id),
            module
        ]));
        if (uniqueModuleIds.some((id) => !sourceModuleMap.has(String(id)))) {
            return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.INVALID_MODULE, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_INVALID_MODULE_MESSAGE);
        }
        // 4. Validate selected tasks belong to their selected modules.
        const requestedTaskIds = modules.flatMap((module) => module.taskIds);
        const sourceTasks = requestedTaskIds.length
            ? await courseTaskModel_1.default.find({
                _id: { $in: requestedTaskIds }
            })
            : [];
        const sourceTaskMap = new Map(sourceTasks.map((task) => [
            String(task._id),
            task
        ]));
        const selections = [];
        for (const moduleSelection of modules) {
            const sourceModule = sourceModuleMap.get(String(moduleSelection.moduleId));
            const resolvedTasks = moduleSelection.taskIds.map((taskId) => {
                const sourceTask = sourceTaskMap.get(String(taskId));
                if (!sourceTask ||
                    String(sourceTask.moduleId) !==
                        String(sourceModule._id)) {
                    return null;
                }
                return sourceTask;
            });
            if (resolvedTasks.some((task) => task === null)) {
                return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.INVALID_TASK, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_INVALID_TASK_MESSAGE);
            }
            selections.push({
                sourceModule,
                sourceTasks: resolvedTasks
            });
        }
        const [existingModuleNames, existingTaskNames] = await Promise.all([
            coursemoduleModel_1.default.distinct('moduleName', {}),
            courseTaskModel_1.default.distinct('taskName', {})
        ]);
        // 6. Start a transaction for all clone writes.
        session = await mongoose_1.default.startSession();
        session.startTransaction();
        const tracker = {
            moduleIds: [],
            taskIds: []
        };
        const data = await performClone(normalizedCourseName, sourceCourse, selections, session, tracker, existingModuleNames, existingTaskNames);
        await session.commitTransaction();
        return {
            success: true,
            data
        };
    }
    catch (error) {
        // Abort only if a transaction is still active.
        if (session === null || session === void 0 ? void 0 : session.inTransaction()) {
            try {
                await session.abortTransaction();
            }
            catch (abortError) {
                console.error('Error aborting clone transaction:', abortError);
            }
        }
        if (isDuplicateCourseNameError(error)) {
            return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_DUPLICATE_NAME_MESSAGE);
        }
        console.error('Error cloning course:', error);
        return failure(courseMessages_1.COURSE_CLONE_ERROR_CODES.CLONE_FAILED, courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE);
    }
    finally {
        if (session) {
            try {
                await session.endSession();
            }
            catch (endError) {
                console.error('Error ending clone session:', endError);
            }
        }
    }
};
exports.default = { cloneCourse };
